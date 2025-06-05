import HeaderBar from './HeaderBar.js';
import SiderBar from './SiderBar.js';
import { Sidebar, Menu, Segment } from 'semantic-ui-react';
import App from '../App.js';
import FooterBar from './Footer.js';
import { ToastContainer } from 'react-toastify';
import React, { useContext, useEffect } from 'react';
import { StyleContext } from '../context/Style/index.js';
import { useTranslation } from 'react-i18next';
import { API, getLogo, getSystemName, showError } from '../helpers/index.js';
import { setStatusData } from '../helpers/data.js';
import { UserContext } from '../context/User/index.js';
import { StatusContext } from '../context/Status/index.js';

const PageLayout = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const [styleState, styleDispatch] = useContext(StyleContext);
  const { i18n } = useTranslation();

  const loadUser = () => {
    let user = localStorage.getItem('user');
    if (user) {
      let data = JSON.parse(user);
      userDispatch({ type: 'login', payload: data });
    }
  };

  const loadStatus = async () => {
    try {
      const res = await API.get('/api/status');
      const { success, data } = res.data;
      if (success) {
        statusDispatch({ type: 'set', payload: data });
        setStatusData(data);
      } else {
        showError('Unable to connect to server');
      }
    } catch (error) {
      showError('Failed to load status');
    }
  };

  useEffect(() => {
    loadUser();
    loadStatus().catch(console.error);
    let systemName = getSystemName();
    if (systemName) {
      document.title = systemName;
    }
    let logo = getLogo();
    if (logo) {
      let linkElement = document.querySelector("link[rel~='icon']");
      if (linkElement) {
        linkElement.href = logo;
      }
    }
    // 从localStorage获取上次使用的语言
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }

    // 默认显示侧边栏
    styleDispatch({ type: 'SET_SIDER', payload: true });
  }, [i18n]);

  // 获取侧边栏折叠状态
  const isSidebarCollapsed =
    localStorage.getItem('default_collapse_sidebar') === 'true';

  return (
    <Sidebar.Pushable as={Segment} style={{ minHeight: '100vh', overflow: 'hidden', border: 'none' }}>
      <Sidebar
        as={Menu}
        animation='push'
        icon='labeled'
        inverted
        vertical
        visible={styleState.showSider}
        width='thin'
        onHide={() => styleDispatch({ type: 'SET_SIDER', payload: false })}
      >
        <SiderBar />
      </Sidebar>
      <Sidebar.Pusher dimmed={styleState.showSider && styleState.isMobile}>
        <HeaderBar />
        <div
          style={{
            marginTop: '56px',
            height: 'calc(100vh - 112px)',
            overflowY: styleState.isMobile ? 'visible' : 'auto',
            padding: styleState.shouldInnerPadding ? '24px' : '0',
          }}
        >
          <App />
        </div>
        <FooterBar />
      </Sidebar.Pusher>
      <ToastContainer />
    </Sidebar.Pushable>
  );
};

export default PageLayout;
