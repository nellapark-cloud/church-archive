// drive-widget.js
// Decap CMS 커스텀 위젯: "children" 필드를 구글 드라이브처럼
// 폴더 클릭 → 들어가기 → 안의 내용만 보기 방식으로 편집할 수 있게 해줍니다.
// createClass / h 는 decap-cms.js가 로드된 후 전역으로 제공됩니다.
//
// 중요: 이 위젯은 자체 state에 데이터를 복사해두지 않고, 항상 this.props.value에서
// 직접 읽어옵니다. Decap이 위젯을 다시 마운트해도(그런 경우가 실제로 있습니다)
// 데이터가 초기화되지 않도록 하기 위한 설계입니다. state는 오직 "지금 어느 폴더를
// 보고 있는지(path)"와 "새 폴더 이름 입력창이 열려있는지" 같은 화면 UI 상태만 담습니다.

var DriveTreeControl = createClass({

  getInitialState: function () {
    return {
      path: [],
      addingFolder: false,
      newFolderName: ''
    };
  },

  getTree: function () {
    var v = this.props.value;
    if (!v) return [];
    if (typeof v.toJS === 'function') return v.toJS();
    return v;
  },

  componentDidUpdate: function (prevProps) {
    var prevMedia = prevProps.mediaPaths && prevProps.mediaPaths.get
      ? prevProps.mediaPaths.get(this._controlID)
      : null;
    var media = this.props.mediaPaths && this.props.mediaPaths.get
      ? this.props.mediaPaths.get(this._controlID)
      : null;
    if (media && media !== prevMedia) {
      this.addFileNode(media);
    }
  },

  emitChange: function (newTree) {
    try {
      this.props.onChange(newTree);
      console.log('[drive-widget] onChange 성공, 새 길이:', newTree.length);
    } catch (err) {
      console.error('[drive-widget] onChange 에러:', err);
    }
  },

  getCurrentChildren: function () {
    var node = { children: this.getTree() };
    for (var i = 0; i < this.state.path.length; i++) {
      if (!node.children || !node.children[this.state.path[i]]) return [];
      node = node.children[this.state.path[i]];
    }
    return node.children || [];
  },

  setCurrentChildren: function (newChildren) {
    var tree = this.getTree();
    var node = { children: tree };
    for (var i = 0; i < this.state.path.length; i++) {
      node = node.children[this.state.path[i]];
    }
    node.children = newChildren;
    this.emitChange(tree);
  },

  enterFolder: function (index) {
    this.setState({ path: this.state.path.concat([index]) });
  },

  goToCrumb: function (depth) {
    this.setState({ path: this.state.path.slice(0, depth) });
  },

  startAddFolder: function () {
    this.setState({ addingFolder: true, newFolderName: '' });
  },

  confirmAddFolder: function () {
    var name = this.state.newFolderName.trim();
    if (!name) { this.setState({ addingFolder: false }); return; }
    var children = this.getCurrentChildren().slice();
    children.push({ type: 'folder', title: name, desc: '', children: [] });
    this.setState({ addingFolder: false, newFolderName: '' });
    this.setCurrentChildren(children);
  },

  removeItem: function (index) {
    var item = this.getCurrentChildren()[index];
    if (!item) return;
    var label = item.type === 'folder' ? item.title : item.name;
    if (!window.confirm('"' + label + '" 항목을 삭제할까요?')) return;
    var children = this.getCurrentChildren().slice();
    children.splice(index, 1);
    this.setCurrentChildren(children);
  },

  renameItem: function (index) {
    var item = this.getCurrentChildren()[index];
    if (!item) return;
    var current = item.type === 'folder' ? item.title : item.name;
    var next = window.prompt('새 이름을 입력하세요', current);
    if (!next) return;
    var children = this.getCurrentChildren().slice();
    if (item.type === 'folder') { children[index] = Object.assign({}, item, { title: next }); }
    else { children[index] = Object.assign({}, item, { name: next }); }
    this.setCurrentChildren(children);
  },

  startUpload: function () {
    this._controlID = this._controlID || ('drivewidget' + Math.random().toString(36).slice(2));
    this.props.onOpenMediaLibrary({
      controlID: this._controlID,
      forImage: false,
      allowMultiple: false
    });
  },

  addFileNode: function (mediaPath) {
    var filename = mediaPath.split('/').pop();
    var children = this.getCurrentChildren().slice();
    children.push({ type: 'file', name: filename, desc: '', file: mediaPath });
    this.setCurrentChildren(children);
  },

  render: function () {
    var self = this;
    var children = this.getCurrentChildren();
    var fullTree = this.getTree();

    // 경로(빵부스러기)
    var crumbNodes = [h('span', {
      key: 'root',
      style: { cursor: 'pointer', color: '#A9814E', fontWeight: 600 },
      onClick: function () { self.goToCrumb(0); }
    }, '전체')];

    var node = { children: fullTree };
    for (var i = 0; i < this.state.path.length; i++) {
      node = node.children[this.state.path[i]];
      if (!node) break;
      crumbNodes.push(h('span', { key: 'sep' + i, style: { margin: '0 6px', color: '#999' } }, '/'));
      crumbNodes.push(h('span', {
        key: 'crumb' + i,
        style: { cursor: 'pointer', color: (i === this.state.path.length - 1) ? '#1C2230' : '#A9814E', fontWeight: 600 },
        onClick: (function (depth) { return function () { self.goToCrumb(depth); }; })(i + 1)
      }, node.title));
    }

    var tiles = children.map(function (item, index) {
      var isFolder = item.type === 'folder';
      return h('div', {
        key: index,
        style: {
          border: '1px solid #E4DFD3', borderRadius: '4px', padding: '12px 10px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          background: '#fff', position: 'relative'
        }
      },
        h('div', {
          style: { fontSize: '28px', cursor: isFolder ? 'pointer' : 'default' },
          onClick: function () { if (isFolder) self.enterFolder(index); }
        }, isFolder ? '\uD83D\uDCC1' : '\uD83D\uDCC4'),
        h('div', {
          style: { fontSize: '12.5px', textAlign: 'center', cursor: isFolder ? 'pointer' : 'default', wordBreak: 'break-word' },
          onClick: function () { if (isFolder) self.enterFolder(index); }
        }, isFolder ? item.title : item.name),
        h('div', { style: { display: 'flex', gap: '6px', marginTop: '4px' } },
          h('button', {
            type: 'button',
            style: { fontSize: '11px', padding: '2px 6px', cursor: 'pointer' },
            onClick: function () { self.renameItem(index); }
          }, '이름변경'),
          h('button', {
            type: 'button',
            style: { fontSize: '11px', padding: '2px 6px', cursor: 'pointer', color: '#a3392f' },
            onClick: function () { self.removeItem(index); }
          }, '삭제')
        )
      );
    });

    return h('div', { id: this.props.forID, className: this.props.classNameWrapper },
      h('div', { style: { marginBottom: '12px', fontSize: '13px' } }, crumbNodes),
      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '10px', marginBottom: '14px', minHeight: '40px'
        }
      }, tiles),
      this.state.addingFolder
        ? h('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px' } },
            h('input', {
              type: 'text',
              autoFocus: true,
              value: this.state.newFolderName,
              placeholder: '새 폴더 이름',
              style: { flex: '1', padding: '6px 8px' },
              onChange: function (e) { self.setState({ newFolderName: e.target.value }); },
              onKeyDown: function (e) { if (e.key === 'Enter') self.confirmAddFolder(); }
            }),
            h('button', { type: 'button', onClick: function () { self.confirmAddFolder(); } }, '추가'),
            h('button', { type: 'button', onClick: function () { self.setState({ addingFolder: false }); } }, '취소')
          )
        : h('div', { style: { display: 'flex', gap: '8px' } },
            h('button', { type: 'button', onClick: function () { self.startAddFolder(); } }, '+ 새 폴더'),
            h('button', { type: 'button', onClick: function () { self.startUpload(); } }, '+ 자료 업로드')
          )
    );
  }
});

CMS.registerWidget('drive_tree', DriveTreeControl);
