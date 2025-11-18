<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config/database.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$app = AppFactory::create();
$app->addBodyParsingMiddleware();

// Enable CORS
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, X-API-Key')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

// JWT Secret Key
$jwtSecret = "WZzfRPXHmbv8COqfJCINS1MxvDsoF2245nFLV0UGF/E=";

// Database connection
$database = new Database();
$db = $database->getConnection();

// Utility functions
function generateToken($userId, $email) {
    global $jwtSecret;
    $payload = [
        'userId' => $userId,
        'email' => $email,
        'exp' => time() + (60 * 60 * 24 * 7) // 7 дней
    ];
    return JWT::encode($payload, $jwtSecret, 'HS256');
}

function verifyPassword($password, $hashedPassword) {
    return password_verify($password, $hashedPassword);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Функции для работы с ролями
function getUserRoles($userId) {
    global $db;
    $query = "SELECT r.name FROM roles r 
              JOIN user_roles ur ON r.id = ur.role_id 
              WHERE ur.user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function hasRole($userId, $roleName) {
    $roles = getUserRoles($userId);
    return in_array($roleName, $roles);
}

// Auth Middleware
$authMiddleware = function ($request, $handler) use ($jwtSecret, $db) {
    $token = null;
    $headers = $request->getHeaders();
    
    if (isset($headers['Authorization'][0])) {
        $authHeader = $headers['Authorization'][0];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }

    if (!$token) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode(['error' => 'Token required']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    try {
        $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
        $request = $request->withAttribute('user_id', $decoded->userId);
        $request = $request->withAttribute('user_email', $decoded->email);
        return $handler->handle($request);
    } catch (Exception $e) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode(['error' => 'Invalid token']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
};

// Admin Auth Middleware (обновленная)
$adminAuthMiddleware = function ($request, $handler) use ($jwtSecret, $db) {
    $token = null;
    $headers = $request->getHeaders();
    
    if (isset($headers['Authorization'][0])) {
        $authHeader = $headers['Authorization'][0];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }

    if (!$token) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode(['error' => 'Admin token required']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    try {
        $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
        $userId = $decoded->userId;
        
        // Проверяем есть ли у пользователя роль админа
        if (!hasRole($userId, 'admin')) {
            throw new Exception('Admin access required');
        }
        
        $request = $request->withAttribute('user_id', $userId);
        $request = $request->withAttribute('user_email', $decoded->email);
        return $handler->handle($request);
        
    } catch (Exception $e) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode([
            'error' => 'Invalid admin token',
            'debug' => $e->getMessage()
        ]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
};

// Auth Routes
$app->post('/api/auth/register', function (Request $request, Response $response) use ($db) {
    $data = $request->getParsedBody();
    
    $email = $data['email'] ?? '';
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($username) || empty($password)) {
        $response->getBody()->write(json_encode(['error' => 'Все поля обязательны']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Check if user exists
    $checkQuery = "SELECT id FROM users WHERE email = ? OR username = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$email, $username]);
    
    if ($checkStmt->fetch()) {
        $response->getBody()->write(json_encode(['error' => 'Пользователь с таким email или username уже существует']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Create user
    $hashedPassword = hashPassword($password);
    $insertQuery = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
    $insertStmt = $db->prepare($insertQuery);
    
    if ($insertStmt->execute([$email, $username, $hashedPassword])) {
        $userId = $db->lastInsertId();
        
        // Добавляем роль customer по умолчанию
        $roleQuery = "INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = 'customer'))";
        $roleStmt = $db->prepare($roleQuery);
        $roleStmt->execute([$userId]);
        
        // Create subscription
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        $subQuery = "INSERT INTO subscriptions (user_id, plan_type, status, expires_at) VALUES (?, 'free', 'active', ?)";
        $subStmt = $db->prepare($subQuery);
        $subStmt->execute([$userId, $expiresAt]);
        
        // Generate license key
        $licenseKey = 'SNC-VST-' . date('Y') . '-' . str_pad($userId, 3, '0', STR_PAD_LEFT) . '-' . strtoupper(bin2hex(random_bytes(3)));
        $licenseQuery = "INSERT INTO licenses (user_id, license_key, status) VALUES (?, ?, 'active')";
        $licenseStmt = $db->prepare($licenseQuery);
        $licenseStmt->execute([$userId, $licenseKey]);
        
        // Generate token and create session
        $token = generateToken($userId, $email);
        
        // Save session to database
        $sessionExpires = date('Y-m-d H:i:s', strtotime('+7 days'));
        $sessionQuery = "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)";
        $sessionStmt = $db->prepare($sessionQuery);
        $sessionStmt->execute([$userId, $token, $sessionExpires]);
        
        $response->getBody()->write(json_encode([
            'message' => 'Пользователь создан успешно',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'username' => $username,
                'roles' => ['customer'],
                'license_key' => $licenseKey
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Ошибка регистрации']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

$app->post('/api/auth/login', function (Request $request, Response $response) use ($db, $jwtSecret) {
    $data = $request->getParsedBody();
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        $response->getBody()->write(json_encode(['error' => 'Email и пароль обязательны']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $query = "SELECT id, email, username, password FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && verifyPassword($password, $user['password'])) {
        $token = generateToken($user['id'], $user['email']);
        
        // Получаем роли пользователя
        $roles = getUserRoles($user['id']);
        
        // Save session to database
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));
        $sessionQuery = "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)";
        $sessionStmt = $db->prepare($sessionQuery);
        $sessionStmt->execute([$user['id'], $token, $expiresAt]);
        
        // Get user license
        $licenseQuery = "SELECT license_key, status FROM licenses WHERE user_id = ?";
        $licenseStmt = $db->prepare($licenseQuery);
        $licenseStmt->execute([$user['id']]);
        $license = $licenseStmt->fetch(PDO::FETCH_ASSOC);
        
        $response->getBody()->write(json_encode([
            'message' => 'Вход выполнен успешно',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'roles' => $roles,
                'license' => $license
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Неверный email или пароль']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

$app->get('/api/auth/me', function (Request $request, Response $response) use ($db) {
    $userId = $request->getAttribute('user_id');
    
    $query = "SELECT u.id, u.email, u.username, u.created_at, u.status, u.avatar_url,
                     l.license_key, l.status as license_status,
                     s.plan_type, s.status as subscription_status, s.expires_at
              FROM users u 
              LEFT JOIN licenses l ON u.id = l.user_id 
              LEFT JOIN subscriptions s ON u.id = s.user_id 
              WHERE u.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Получаем роли пользователя
        $roles = getUserRoles($userId);
        
        $response->getBody()->write(json_encode([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'created_at' => $user['created_at'],
                'status' => $user['status'],
                'avatar_url' => $user['avatar_url'],
                'roles' => $roles,
                'license' => [
                    'license_key' => $user['license_key'],
                    'status' => $user['license_status']
                ],
                'subscription' => [
                    'plan_type' => $user['plan_type'],
                    'status' => $user['subscription_status'],
                    'expires_at' => $user['expires_at']
                ]
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Пользователь не найден']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

// Admin Login (ОБНОВЛЕННЫЙ - теперь проверяет пользователя с ролью admin)
$app->post('/api/admin/login', function (Request $request, Response $response) use ($db, $jwtSecret) {
    $data = $request->getParsedBody();
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        $response->getBody()->write(json_encode(['error' => 'Email и пароль обязательны']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Ищем пользователя
    $query = "SELECT id, email, username, password FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && verifyPassword($password, $user['password'])) {
        // Проверяем есть ли у пользователя роль admin
        $roles = getUserRoles($user['id']);
        
        if (!in_array('admin', $roles)) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => 'Access denied. Admin role required.'
            ]));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $token = generateToken($user['id'], $user['email']);
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Admin login successful',
            'token' => $token,
            'admin' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'roles' => $roles
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode([
            'success' => false,
            'error' => 'Invalid credentials'
        ]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

// Admin Support Messages Endpoint - ДОБАВЬТЕ ЭТОТ КОД
$app->get('/api/admin/support/chats/{id}/messages', function (Request $request, Response $response, array $args) use ($db) {
    $adminId = $request->getAttribute('user_id');
    $chatId = $args['id'];
    
    try {
        // Проверяем что пользователь админ (уже проверено в middleware)
        // Получаем сообщения для админа (все сообщения чата)
        $messagesQuery = "
            SELECT 
                sm.id,
                sm.message,
                sm.user_id,
                sm.created_at,
                sm.is_read,
                u.username,
                u.email
            FROM support_messages sm
            JOIN users u ON sm.user_id = u.id
            WHERE sm.chat_id = ?
            ORDER BY sm.created_at ASC
        ";
        
        $messagesStmt = $db->prepare($messagesQuery);
        $messagesStmt->execute([$chatId]);
        $messages = $messagesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Помечаем сообщения пользователя как прочитанные когда админ открывает чат
        $updateQuery = "UPDATE support_messages SET is_read = TRUE WHERE chat_id = ? AND user_id != ? AND is_read = FALSE";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$chatId, $adminId]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'messages' => $messages
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to fetch messages: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);

// Support Routes - ДОБАВЛЕНО
$app->get('/api/support/chats', function (Request $request, Response $response) use ($db) {
    $userId = $request->getAttribute('user_id');
    
    try {
        $query = "
            SELECT 
                sc.id,
                sc.subject,
                sc.status,
                sc.created_at,
                sc.updated_at,
                u.username as user_name,
                (SELECT COUNT(*) FROM support_messages sm WHERE sm.chat_id = sc.id AND sm.user_id != ? AND sm.is_read = FALSE) as unread_count
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            WHERE sc.user_id = ?
            ORDER BY sc.updated_at DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId, $userId]);
        $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode([
            'success' => true,
            'chats' => $chats
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to fetch chats: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

$app->post('/api/support/chats', function (Request $request, Response $response) use ($db) {
    $userId = $request->getAttribute('user_id');
    $data = $request->getParsedBody();
    
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';

    if (empty($subject) || empty($message)) {
        $response->getBody()->write(json_encode(['error' => 'Тема и сообщение обязательны']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    try {
        // Создаем чат
        $chatQuery = "INSERT INTO support_chats (user_id, subject) VALUES (?, ?)";
        $chatStmt = $db->prepare($chatQuery);
        $chatStmt->execute([$userId, $subject]);
        $chatId = $db->lastInsertId();

        // Добавляем первое сообщение
        $messageQuery = "INSERT INTO support_messages (chat_id, user_id, message) VALUES (?, ?, ?)";
        $messageStmt = $db->prepare($messageQuery);
        $messageStmt->execute([$chatId, $userId, $message]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Чат создан успешно',
            'chat_id' => $chatId
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to create chat: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

$app->get('/api/support/chats/{id}/messages', function (Request $request, Response $response, array $args) use ($db) {
    $userId = $request->getAttribute('user_id');
    $chatId = $args['id'];
    
    try {
        // Проверяем доступ к чату
        $accessQuery = "SELECT id FROM support_chats WHERE id = ? AND user_id = ?";
        $accessStmt = $db->prepare($accessQuery);
        $accessStmt->execute([$chatId, $userId]);
        
        if (!$accessStmt->fetch()) {
            $response->getBody()->write(json_encode(['error' => 'Chat not found or access denied']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Получаем сообщения
        $messagesQuery = "
            SELECT 
                sm.id,
                sm.message,
                sm.user_id,
                sm.created_at,
                sm.is_read,
                u.username,
                u.email
            FROM support_messages sm
            JOIN users u ON sm.user_id = u.id
            WHERE sm.chat_id = ?
            ORDER BY sm.created_at ASC
        ";
        
        $messagesStmt = $db->prepare($messagesQuery);
        $messagesStmt->execute([$chatId]);
        $messages = $messagesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Помечаем сообщения поддержки как прочитанные
        $updateQuery = "UPDATE support_messages SET is_read = TRUE WHERE chat_id = ? AND user_id != ? AND is_read = FALSE";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$chatId, $userId]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'messages' => $messages
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to fetch messages: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

$app->post('/api/support/chats/{id}/messages', function (Request $request, Response $response, array $args) use ($db) {
    $userId = $request->getAttribute('user_id');
    $chatId = $args['id'];
    $data = $request->getParsedBody();
    
    $message = $data['message'] ?? '';

    if (empty($message)) {
        $response->getBody()->write(json_encode(['error' => 'Сообщение не может быть пустым']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    try {
        // Проверяем доступ к чату
        $accessQuery = "SELECT id FROM support_chats WHERE id = ? AND user_id = ?";
        $accessStmt = $db->prepare($accessQuery);
        $accessStmt->execute([$chatId, $userId]);
        
        if (!$accessStmt->fetch()) {
            $response->getBody()->write(json_encode(['error' => 'Chat not found or access denied']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Добавляем сообщение
        $messageQuery = "INSERT INTO support_messages (chat_id, user_id, message) VALUES (?, ?, ?)";
        $messageStmt = $db->prepare($messageQuery);
        $messageStmt->execute([$chatId, $userId, $message]);

        // Обновляем время чата
        $updateQuery = "UPDATE support_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$chatId]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Сообщение отправлено'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to send message: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

// Admin Support Routes - ДОБАВЛЕНО
$app->get('/api/admin/support/chats', function (Request $request, Response $response) use ($db) {
    try {
        $query = "
            SELECT 
                sc.id,
                sc.subject,
                sc.status,
                sc.created_at,
                sc.updated_at,
                u.username as user_name,
                u.email as user_email,
                (SELECT COUNT(*) FROM support_messages sm WHERE sm.chat_id = sc.id AND sm.user_id != u.id AND sm.is_read = FALSE) as unread_count
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            ORDER BY sc.updated_at DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode([
            'success' => true,
            'chats' => $chats
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to fetch support chats: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);

$app->post('/api/admin/support/chats/{id}/messages', function (Request $request, Response $response, array $args) use ($db) {
    $adminId = $request->getAttribute('user_id');
    $chatId = $args['id'];
    $data = $request->getParsedBody();
    
    $message = $data['message'] ?? '';

    if (empty($message)) {
        $response->getBody()->write(json_encode(['error' => 'Сообщение не может быть пустым']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    try {
        // Добавляем сообщение от поддержки
        $messageQuery = "INSERT INTO support_messages (chat_id, user_id, message) VALUES (?, ?, ?)";
        $messageStmt = $db->prepare($messageQuery);
        $messageStmt->execute([$chatId, $adminId, $message]);

        // Обновляем время чата
        $updateQuery = "UPDATE support_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$chatId]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Ответ отправлен'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to send response: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);

$app->patch('/api/admin/support/chats/{id}/status', function (Request $request, Response $response, array $args) use ($db) {
    $chatId = $args['id'];
    $data = $request->getParsedBody();
    
    $status = $data['status'] ?? '';

    if (!in_array($status, ['open', 'closed', 'pending'])) {
        $response->getBody()->write(json_encode(['error' => 'Invalid status']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    try {
        $query = "UPDATE support_chats SET status = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$status, $chatId]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Статус чата обновлен'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to update chat status: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);

// Остальные admin endpoints
$app->get('/api/admin/stats', function (Request $request, Response $response) use ($db) {
    try {
        // Общее количество пользователей
        $stmt = $db->query("SELECT COUNT(*) as total FROM users");
        $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Общее количество лицензий
        $stmt = $db->query("SELECT COUNT(*) as total FROM licenses");
        $totalLicenses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Активные подписки
        $stmt = $db->query("SELECT COUNT(*) as total FROM subscriptions WHERE status = 'active'");
        $activeSubscriptions = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Новые регистрации (за последние 7 дней)
        $stmt = $db->prepare("
            SELECT COUNT(*) as total 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ");
        $stmt->execute();
        $recentRegistrations = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $response->getBody()->write(json_encode([
            'success' => true,
            'stats' => [
                'totalUsers' => (int)$totalUsers,
                'totalLicenses' => (int)$totalLicenses,
                'activeSubscriptions' => (int)$activeSubscriptions,
                'recentRegistrations' => (int)$recentRegistrations
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to fetch stats: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);

$app->get('/api/admin/users', function (Request $request, Response $response) use ($db) {
    try {
        $query = "
            SELECT 
                u.id,
                u.email,
                u.username,
                u.created_at,
                COALESCE(u.status, 'active') as status,
                l.license_key,
                s.status as subscription_status
            FROM users u
            LEFT JOIN licenses l ON u.id = l.user_id
            LEFT JOIN subscriptions s ON u.id = s.user_id
            ORDER BY u.created_at DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode([
            'success' => true,
            'users' => $users
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Failed to fetch users: ' . $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);

// Добавьте этот endpoint после других admin endpoints
$app->get('/api/admin/me', function (Request $request, Response $response) use ($db) {
    $adminId = $request->getAttribute('user_id');
    
    $query = "SELECT id, email, username FROM users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        $response->getBody()->write(json_encode([
            'success' => true,
            'admin' => $admin
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Admin not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
})->add($adminAuthMiddleware);


// Get user profile
$app->get('/api/user/profile', function (Request $request, Response $response) use ($db) {
    $userId = $request->getAttribute('user_id');
    
    $query = "SELECT u.id, u.email, u.username, u.created_at, u.status, u.avatar_url,
                     l.license_key, l.status as license_status,
                     s.plan_type, s.status as subscription_status, s.expires_at
              FROM users u 
              LEFT JOIN licenses l ON u.id = l.user_id 
              LEFT JOIN subscriptions s ON u.id = s.user_id 
              WHERE u.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $response->getBody()->write(json_encode([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'created_at' => $user['created_at'],
                'status' => $user['status'],
                'avatar_url' => $user['avatar_url'],
                'license' => [
                    'license_key' => $user['license_key'],
                    'status' => $user['license_status']
                ],
                'subscription' => [
                    'plan_type' => $user['plan_type'],
                    'status' => $user['subscription_status'],
                    'expires_at' => $user['expires_at']
                ]
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Пользователь не найден']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

// Update user profile
$app->put('/api/user/profile', function (Request $request, Response $response) use ($db) {
    $userId = $request->getAttribute('user_id');
    $data = $request->getParsedBody();
    
    $email = $data['email'] ?? '';
    $username = $data['username'] ?? '';
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    $avatarUrl = $data['avatar_url'] ?? '';

    // Проверяем уникальность email и username
    $checkQuery = "SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$email, $username, $userId]);
    
    if ($checkStmt->fetch()) {
        $response->getBody()->write(json_encode(['error' => 'Email или username уже заняты']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Если меняется пароль, проверяем текущий
    if (!empty($newPassword)) {
        $passwordQuery = "SELECT password FROM users WHERE id = ?";
        $passwordStmt = $db->prepare($passwordQuery);
        $passwordStmt->execute([$userId]);
        $user = $passwordStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($currentPassword, $user['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Неверный текущий пароль']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    }

    // Подготавливаем запрос на обновление
    $updateFields = [];
    $updateValues = [];
    
    $updateFields[] = "email = ?";
    $updateValues[] = $email;
    
    $updateFields[] = "username = ?";
    $updateValues[] = $username;
    
    if (!empty($newPassword)) {
        $updateFields[] = "password = ?";
        $updateValues[] = $hashedPassword;
    }
    
    if (!empty($avatarUrl)) {
        $updateFields[] = "avatar_url = ?";
        $updateValues[] = $avatarUrl;
    }
    
    $updateValues[] = $userId;

    $updateQuery = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    
    if ($updateStmt->execute($updateValues)) {
        // Получаем обновленные данные пользователя
        $query = "SELECT u.id, u.email, u.username, u.created_at, u.status, u.avatar_url,
                         l.license_key, l.status as license_status,
                         s.plan_type, s.status as subscription_status, s.expires_at
                  FROM users u 
                  LEFT JOIN licenses l ON u.id = l.user_id 
                  LEFT JOIN subscriptions s ON u.id = s.user_id 
                  WHERE u.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode([
            'message' => 'Профиль успешно обновлен',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'created_at' => $user['created_at'],
                'status' => $user['status'],
                'avatar_url' => $user['avatar_url'],
                'license' => [
                    'license_key' => $user['license_key'],
                    'status' => $user['license_status']
                ],
                'subscription' => [
                    'plan_type' => $user['plan_type'],
                    'status' => $user['subscription_status'],
                    'expires_at' => $user['expires_at']
                ]
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Ошибка обновления профиля']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

// Upload avatar
$app->post('/api/user/avatar', function (Request $request, Response $response) use ($db) {
    $userId = $request->getAttribute('user_id');
    
    $uploadedFiles = $request->getUploadedFiles();
    $avatar = $uploadedFiles['avatar'] ?? null;

    if (!$avatar || $avatar->getError() !== UPLOAD_ERR_OK) {
        $response->getBody()->write(json_encode(['error' => 'Ошибка загрузки файла']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Проверяем тип файла
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $mimeType = $avatar->getClientMediaType();
    if (!in_array($mimeType, $allowedTypes)) {
        $response->getBody()->write(json_encode(['error' => 'Недопустимый тип файла']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Проверяем размер файла (максимум 5MB)
    if ($avatar->getSize() > 5 * 1024 * 1024) {
        $response->getBody()->write(json_encode(['error' => 'Файл слишком большой']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Создаем директорию если не существует
    $uploadDir = __DIR__ . '/../uploads/avatars';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Генерируем уникальное имя файла
    $extension = pathinfo($avatar->getClientFilename(), PATHINFO_EXTENSION);
    $filename = 'avatar_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . '/' . $filename;

    try {
        $avatar->moveTo($filepath);
        
        // Сохраняем URL аватара в базе данных
        $avatarUrl = '/uploads/avatars/' . $filename;
        $updateQuery = "UPDATE users SET avatar_url = ? WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$avatarUrl, $userId]);

        $response->getBody()->write(json_encode([
            'message' => 'Аватар успешно загружен',
            'avatar_url' => $avatarUrl
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Ошибка сохранения файла']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

$app->get('/uploads/avatars/{filename}', function (Request $request, Response $response, array $args) {
    $filename = $args['filename'];
    
    // Правильный путь для вашей структуры
    $basePath = realpath(__DIR__ . '/../../');
    $filePath = $basePath . '/uploads/avatars/' . $filename;
    
    // Логирование для отладки
    error_log("Avatar request: " . $filename);
    error_log("Full path: " . $filePath);
    error_log("File exists: " . (file_exists($filePath) ? 'yes' : 'no'));
    
    if (!file_exists($filePath)) {
        error_log("Avatar file not found: " . $filePath);
        return $response->withStatus(404);
    }

    // Определяем MIME тип
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $mimeTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp'
    ];
    
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
    
    $response = $response->withHeader('Content-Type', $mimeType);
    $response->getBody()->write(file_get_contents($filePath));
    return $response;
});

$app->get('/debug/avatar-path', function (Request $request, Response $response) {
    $basePath = realpath(__DIR__ . '/../../');
    $avatarsDir = $basePath . '/uploads/avatars';
    
    $files = [];
    if (is_dir($avatarsDir)) {
        $files = scandir($avatarsDir);
    }
    
    $response->getBody()->write(json_encode([
        'base_path' => $basePath,
        'avatars_dir' => $avatarsDir,
        'dir_exists' => is_dir($avatarsDir),
        'files' => $files
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Logout endpoint
$app->post('/api/auth/logout', function (Request $request, Response $response) use ($db) {
    $token = null;
    $headers = $request->getHeaders();
    
    if (isset($headers['Authorization'][0])) {
        $authHeader = $headers['Authorization'][0];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }

    if ($token) {
        // Delete session from database
        $deleteQuery = "DELETE FROM sessions WHERE token = ?";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->execute([$token]);
    }

    $response->getBody()->write(json_encode(['message' => 'Выход выполнен успешно']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Public routes
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode([
        'message' => 'VST Backend API is running!',
        'endpoints' => [
            '/api' => 'API status',
            '/api/auth/register' => 'User registration',
            '/api/auth/login' => 'User login',
            '/api/auth/me' => 'Get current user (protected)',
            '/api/auth/logout' => 'User logout',
            '/api/admin/login' => 'Admin login',
            '/api/admin/stats' => 'Admin stats (protected)',
            '/api/admin/users' => 'Admin users list (protected)',
            '/api/support/chats' => 'User support chats (protected)',
            '/api/admin/support/chats' => 'Admin support chats (protected)'
        ]
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['message' => 'VST API is running']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Handle preflight OPTIONS requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Handle 404
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
    $response->getBody()->write(json_encode(['error' => 'Endpoint not found']));
    return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
});

$app->run();
?>