import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/User';
import { StatusContext } from '../context/Status';
import { useTranslation } from 'react-i18next';

import {
  API,
  getLogo,
  getSystemName,
  isAdmin,
  isMobile,
  showError,
} from '../helpers';
import '../index.css';

import {
  IconCalendarClock,
  IconChecklistStroked,
  IconComment,
  IconCommentStroked,
  IconCreditCard,
  IconGift,
  IconHelpCircle,
  IconHistogram,
  IconHome,
  IconImage,
  IconKey,
  IconLayers,
  IconPriceTag,
  IconSetting,
  IconUser,
} from '@douyinfe/semi-icons';
import { Menu } from 'semantic-ui-react';
import { setStatusData } from '../helpers/data.js';
import { StyleContext } from '../context/Style/index.js';
// Define routerMap as a constant outside the component
const routerMap = {
  home: '/',
  channel: '/channel',
  token: '/token',
  redemption: '/redemption',
  topup: '/topup',
  user: '/user',
  log: '/log',
  midjourney: '/midjourney',
  setting: '/setting',
  about: '/about',
  detail: '/detail',
  pricing: '/pricing',
  task: '/task',
  playground: '/playground',
  personal: '/personal',
};

const SiderBar = () => {
  const { t } = useTranslation();
  const [styleState, styleDispatch] = useContext(StyleContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [chatItems, setChatItems] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);

  // 预先计算所有可能的图标样式
  const allItemKeys = useMemo(() => {
    const keys = [
      'home',
      'channel',
      'token',
      'redemption',
      'topup',
      'user',
      'log',
      'midjourney',
      'setting',
      'about',
      'chat',
      'detail',
      'pricing',
      'task',
      'playground',
      'personal',
    ];
    // 添加聊天项的keys
    for (let i = 0; i < chatItems.length; i++) {
      keys.push('chat' + i);
    }
    return keys;
  }, [chatItems]);


  const workspaceItems = useMemo(
    () => [
      {
        text: t('数据看板'),
        itemKey: 'detail',
        to: '/detail',
        icon: <IconCalendarClock />,
        className:
          localStorage.getItem('enable_data_export') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('API令牌'),
        itemKey: 'token',
        to: '/token',
        icon: <IconKey />,
      },
      {
        text: t('使用日志'),
        itemKey: 'log',
        to: '/log',
        icon: <IconHistogram />,
      },
      {
        text: t('绘图日志'),
        itemKey: 'midjourney',
        to: '/midjourney',
        icon: <IconImage />,
        className:
          localStorage.getItem('enable_drawing') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('任务日志'),
        itemKey: 'task',
        to: '/task',
        icon: <IconChecklistStroked />,
        className:
          localStorage.getItem('enable_task') === 'true' ? '' : 'tableHiddle',
      },
    ],
    [
      localStorage.getItem('enable_data_export'),
      localStorage.getItem('enable_drawing'),
      localStorage.getItem('enable_task'),
      t,
    ],
  );

  const financeItems = useMemo(
    () => [
      {
        text: t('钱包'),
        itemKey: 'topup',
        to: '/topup',
        icon: <IconCreditCard />,
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
        icon: <IconUser />,
      },
    ],
    [t],
  );

  const adminItems = useMemo(
    () => [
      {
        text: t('渠道'),
        itemKey: 'channel',
        to: '/channel',
        icon: <IconLayers />,
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('兑换码'),
        itemKey: 'redemption',
        to: '/redemption',
        icon: <IconGift />,
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/user',
        icon: <IconUser />,
      },
      {
        text: t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        icon: <IconSetting />,
      },
    ],
    [isAdmin(), t],
  );

  const chatMenuItems = useMemo(
    () => [
      {
        text: 'Playground',
        itemKey: 'playground',
        to: '/playground',
        icon: <IconCommentStroked />,
      },
      {
        text: t('聊天'),
        itemKey: 'chat',
        items: chatItems,
        icon: <IconComment />,
      },
    ],
    [chatItems, t],
  );

  // Function to update router map with chat routes
  const updateRouterMapWithChats = (chats) => {
    const newRouterMap = { ...routerMap };

    if (Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        newRouterMap['chat' + i] = '/chat/' + i;
      }
    }

    setRouterMapState(newRouterMap);
    return newRouterMap;
  };

  // Update the useEffect for chat items
  useEffect(() => {
    let chats = localStorage.getItem('chats');
    if (chats) {
      try {
        chats = JSON.parse(chats);
        if (Array.isArray(chats)) {
          let chatItems = [];
          for (let i = 0; i < chats.length; i++) {
            let chat = {};
            for (let key in chats[i]) {
              chat.text = key;
              chat.itemKey = 'chat' + i;
              chat.to = '/chat/' + i;
            }
            chatItems.push(chat);
          }
          setChatItems(chatItems);

          // Update router map with chat routes
          updateRouterMapWithChats(chats);
        }
      } catch (e) {
        console.error(e);
        showError('聊天数据解析失败');
      }
    }
  }, []);

  // Update the useEffect for route selection
  useEffect(() => {
    const currentPath = location.pathname;
    let matchingKey = Object.keys(routerMapState).find(
      (key) => routerMapState[key] === currentPath,
    );

    // Handle chat routes
    if (!matchingKey && currentPath.startsWith('/chat/')) {
      const chatIndex = currentPath.split('/').pop();
      if (!isNaN(chatIndex)) {
        matchingKey = 'chat' + chatIndex;
      } else {
        matchingKey = 'chat';
      }
    }

    // If we found a matching key, update the selected keys
    if (matchingKey) {
      setSelectedKeys([matchingKey]);
    }
  }, [location.pathname, routerMapState]);


  // Custom divider style
  const menuItems = [
    ...chatMenuItems,
    ...workspaceItems,
    ...(isAdmin() ? adminItems : []),
    ...financeItems,
  ];

  return (
    <Menu vertical fluid style={{ height: '100%' }}>
      {menuItems.map((item) => (
        <Menu.Item
          key={item.itemKey}
          as={Link}
          to={item.to}
          active={selectedKeys.includes(item.itemKey)}
          onClick={() => setSelectedKeys([item.itemKey])}
        >
          {item.icon}
          {item.text}
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default SiderBar;
