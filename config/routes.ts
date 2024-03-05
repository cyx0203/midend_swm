export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        name: '登录',
        component: './Common/user/Login',
      },
      {
        component: './Common/exception/404',
      },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    hideInMenu: true,
    component: './Common/welcome/index',
    // access: 'canLogin',
  },
  {
    path: '/system',
    name: '系统管理',
    icon: 'smile',
    hideInMenu: true,
    routes: [
      {
        path: '/system/role',
        name: '角色管理',
        component: '../pages/System/Role',
      },
      {
        path: '/system/user',
        name: '用户管理',
        component: '../pages/System/Users',
      },
    ],
  },
  {
    path: '/swm',
    name: '工作台',
    flatMenu: true,
    component: '../layouts/basic',
    routes: [
      {
        path: '/swm',
        redirect: '/swm/vtm',
      },
      {
        path: 'vtm',
        name: '业务办理',
        icon: 'videoCamera',
        component: './SWM/vtm',
        serviceIndex: true,
        routes: [
          {
            path: '/swm/vtm',
            redirect: '/swm/vtm/menus',
          },
          {
            path: '/swm/vtm/menus',
            name: '业务菜单选择',
            hideInMenu: true,
            component: './Service',
          },
          {
            path: '/swm/vtm/chuyuanjiesuan',
            name: '出院结算',
            hideInMenu: true,
            showInContainer: true,
            component: './Service/chuyuanjiesuan',
          },
          {
            path: '/swm/vtm/menzhentuifei',
            name: '门诊退费',
            hideInMenu: true,
            showInContainer: true,
            component: './Service/menzhentuifei',
          },
          {
            path: '/swm/vtm/unknown',
            name: '业务正在开发中',
            hideInMenu: true,
            component: './Service/unknown',
          },
          // {
          //   path: '/swm/vtm/*',
          //   component: './Service/constructing',
          // },
        ],
      },
      {
        path: 'settle',
        name: '门诊退费',
        icon: 'dashboard',
        hideInMenu: true,
        component: './SWM/settle',
      },
      {
        path: 'race',
        name: '抢单',
        icon: 'thunderbolt',
        hideInMenu: true,
        component: './SWM/race',
      },
    ],
  },
  {
    path: '/setting',
    name: '个人设置',
    icon: 'smile',
    component: './Common/user/Setting',
    hideInMenu: true,
    // access: 'canLogin',
  },
  {
    path: '/',
    redirect: '/swm',
    component: '../layouts/basic',
    // access: 'canLogin',
  },
  {
    path: '/exception',
    component: './Common/exception/Exception',
  },
];
