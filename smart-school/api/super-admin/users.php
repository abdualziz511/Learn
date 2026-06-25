<?php
// api/super-admin/users.php

use Core\Validator;
use Core\Response;
use Services\UserService;

/** @var \Core\Request $req */

$method = $req->method();
$userService = new UserService();

switch ($method) {
    case 'GET':
        $id = $req->param('id');
        if ($id) {
            $user = $userService->getById((int)$id);
            Response::success($user);
        } else {
            $page = $req->page();
            $perPage = $req->perPage();
            $role = $req->query('role'); // optional filter
            
            $result = $userService->getAll($page, $perPage, $role);
            Response::paginated($result);
        }
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'name'      => 'required|string|min:3|max:150',
            'email'     => 'email|max:150',
            'phone'     => 'string|max:30',
            'password'  => 'required|string|min:6',
            'role'      => 'required|in:super_admin,school_admin,teacher,student,parent',
            'is_active' => 'boolean',
            'school_id' => 'integer' // Used if role is school_admin
        ]);
        $v->failAndRespond();
        
        $data = $v->validated();
        if (empty($data['email']) && empty($data['phone'])) {
            Response::validationError(['phone' => ['يجب إدخال البريد الإلكتروني أو رقم الهاتف على الأقل']]);
        }

        $user = $userService->create($data);
        Response::created($user, 'تم إضافة المستخدم بنجاح');
        break;

    case 'PUT':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المستخدم مطلوب', 400);

        $v = Validator::make($req->all(), [
            'name'      => 'string|min:3|max:150',
            'email'     => 'email|max:150',
            'phone'     => 'string|max:30',
            'password'  => 'string|min:6',
            'role'      => 'in:super_admin,school_admin,teacher,student,parent',
            'is_active' => 'boolean',
            'school_id' => 'integer'
        ]);
        $v->failAndRespond();

        $data = $v->validated();
        $user = $userService->update($id, $data);
        Response::success($user, 'تم تحديث بيانات المستخدم بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المستخدم مطلوب', 400);

        $userService->delete($id);
        Response::success(null, 'تم حذف المستخدم بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
