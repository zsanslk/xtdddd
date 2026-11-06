/* 字号偏好在解析阶段先行应用，避免刷新时字号闪烁 */
    try {
      var _fs = localStorage.getItem('ynhhz-fs');
      if (_fs === 's' || _fs === 'l') document.documentElement.className += ' fs-' + _fs;
    } catch (e) { }
