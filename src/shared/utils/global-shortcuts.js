// https://electronjs.org/docs/api/accelerator
export const DEFAULT_GLOBAL_SHORTCUTS = {
  'preferences.minimize-and-maximize': 'CommandOrControl+Shift+X',
  'app-menu.app.preferences': 'CmdOrCtrl+,',
  'app-menu.archive.new': 'CmdOrCtrl+Shift+N',
  'app-menu.archive.open': 'CmdOrCtrl+O',
  'app-menu.archive.connect-cloud-sources': 'CmdOrCtrl+Shift+C',
  'entry.add-entry': 'CmdOrCtrl+N',
  'group.new-group': 'CmdOrCtrl+G',
  'app-menu.archive.search': 'CmdOrCtrl+F',
  'app-menu.view.condensed-sidebar': 'CmdOrCtrl+Shift+B',
  'entry-menu.username': 'CmdOrCtrl+B',
  'entry-menu.password': 'CmdOrCtrl+C',
  'archive-menu.lock': 'CmdOrCtrl+L'
};

export const getShortcutByKey = (key, stateShortcuts) =>
  stateShortcuts[key] || DEFAULT_GLOBAL_SHORTCUTS[key];
