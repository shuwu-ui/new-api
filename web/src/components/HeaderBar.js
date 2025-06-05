import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import { useSetTheme, useTheme } from '../context/Theme';
import { useTranslation } from 'react-i18next';

import { API, getLogo, getSystemName, isMobile, showSuccess } from '../helpers';
import '../index.css';

import fireworks from 'react-fireworks';

import {
  IconClose,
  IconHelpCircle,
  IconHome,
  IconHomeStroked,
  IconIndentLeft,
  IconComment,
  IconKey,
  IconMenu,
  IconNoteMoneyStroked,
  IconPriceTag,
  IconUser,
  IconLanguage,
  IconInfoCircle,
  IconCreditCard,
  IconTerminal,
} from '@douyinfe/semi-icons';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { stringToColor } from '../helpers/render';
import { StyleContext } from '../context/Style/index.js';
import { StatusContext } from '../context/Status/index.js';

// 自定义顶部栏样式
const headerStyle = {
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  borderBottom: '1px solid var(--semi-color-border)',
  background: 'var(--semi-color-bg-0)',
  transition: 'all 0.3s ease',
  width: '100%',
};

// 自定义顶部栏按钮样式
const headerItemStyle = {
  borderRadius: '4px',
  margin: '0 4px',
  transition: 'all 0.3s ease',
};

// 自定义顶部栏按钮悬停样式
const headerItemHoverStyle = {
  backgroundColor: 'var(--semi-color-primary-light-default)',
  color: 'var(--semi-color-primary)',
};

// 自定义顶部栏Logo样式
const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0 10px',
  height: '100%',
};

// 自定义顶部栏系统名称样式
const systemNameStyle = {
  fontWeight: 'bold',
  fontSize: '18px',
  background:
    'linear-gradient(45deg, var(--semi-color-primary), var(--semi-color-secondary))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  padding: '0 5px',
};

// 自定义顶部栏按钮图标样式
const headerIconStyle = {
  fontSize: '18px',
  transition: 'all 0.3s ease',
};

// 自定义头像样式
const avatarStyle = {
  margin: '4px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
};

// 自定义下拉菜单样式
const dropdownStyle = {
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
};

// 自定义主题切换开关样式
const switchStyle = {
  margin: '0 8px',
};

const HeaderBar = () => {
  const { t, i18n } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [styleState, styleDispatch] = useContext(StyleContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  let navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const systemName = getSystemName();
  const logo = getLogo();
  const currentDate = new Date();
  // enable fireworks on new year(1.1 and 2.9-2.24)
  const isNewYear = currentDate.getMonth() === 0 && currentDate.getDate() === 1;

  // Check if self-use mode is enabled
  const isSelfUseMode = statusState?.status?.self_use_mode_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;

  let buttons = [
    {
      text: t('首页'),
      itemKey: 'home',
      to: '/',
      icon: <IconHome style={headerIconStyle} />,
    },
    {
      text: t('控制台'),
      itemKey: 'detail',
      to: '/',
      icon: <IconTerminal style={headerIconStyle} />,
    },
    {
      text: t('定价'),
      itemKey: 'pricing',
      to: '/pricing',
      icon: <IconPriceTag style={headerIconStyle} />,
    },
    // Only include the docs button if docsLink exists
    ...(docsLink
      ? [
          {
            text: t('文档'),
            itemKey: 'docs',
            isExternal: true,
            externalLink: docsLink,
            icon: <IconHelpCircle style={headerIconStyle} />,
          },
        ]
      : []),
    {
      text: t('关于'),
      itemKey: 'about',
      to: '/about',
      icon: <IconInfoCircle style={headerIconStyle} />,
    },
  ];

  async function logout() {
    await API.get('/api/user/logout');
    showSuccess(t('注销成功!'));
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const handleNewYearClick = () => {
    fireworks.init('root', {});
    fireworks.start();
    setTimeout(() => {
      fireworks.stop();
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    }, 3000);
  };

  const theme = useTheme();
  const setTheme = useSetTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.setAttribute('theme-mode', 'dark');
    } else {
      document.body.removeAttribute('theme-mode');
    }
    // 发送当前主题模式给子页面
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage({ themeMode: theme }, '*');
    }

    if (isNewYear) {
      console.log('Happy New Year!');
    }
  }, [theme]);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.contentWindow.postMessage({ lang: lng }, '*');
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Menu fixed='top' inverted stackable style={headerStyle}>
      <Menu.Item onClick={() => styleDispatch({ type: 'TOGGLE_SIDER' })}>
        <Icon name='bars' />
      </Menu.Item>
      <Menu.Item as={Link} to='/' header>
        {logo && (
          <img
            src={logo}
            alt='logo'
            style={{ height: '24px', marginRight: '8px' }}
          />
        )}
        {systemName}
      </Menu.Item>
      <Menu.Item as={Link} to='/pricing'>{t('定价')}</Menu.Item>
      <Menu.Item as={Link} to='/about'>{t('关于')}</Menu.Item>
      <Menu.Menu position='right'>
        <Menu.Item onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '🌞' : '🌙'}
        </Menu.Item>
        <Dropdown item text={currentLang} pointing>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleLanguageChange('zh')}>中文</Dropdown.Item>
            <Dropdown.Item onClick={() => handleLanguageChange('en')}>English</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {userState.user ? (
          <Dropdown item text={userState.user.username} pointing>
            <Dropdown.Menu>
              <Dropdown.Item onClick={logout}>{t('退出')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <>
            <Menu.Item as={Link} to='/login'>{t('登录')}</Menu.Item>
            {!isSelfUseMode && (
              <Menu.Item as={Link} to='/register'>
                {t('注册')}
              </Menu.Item>
            )}
          </>
        )}
      </Menu.Menu>
    </Menu>
  );
};

export default HeaderBar;
