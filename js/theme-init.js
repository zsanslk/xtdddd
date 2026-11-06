/* 字号偏好在解析阶段先行应用，避免刷新时字号闪烁 */
    try {
      var _fs = localStorage.getItem('ynhhz-fs');
      if (_fs === 's' || _fs === 'l') document.documentElement.className += ' fs-' + _fs;
    } catch (e) { }

    /* 封面初始态：带锚点深链进入时直接跳过封面，其余情况先锁定滚动 */
    try {
      if ((location.hash || '').replace('#', '')) {
        document.documentElement.className += ' cover-skip';
      } else {
        document.documentElement.className += ' cover-open';
      }
    } catch (e) { }
  
