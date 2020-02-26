export const IKeymapService = Symbol('IKeymapService');

export interface KeybindingItem {
  id: string;
  /**
   * 命令ID
   */
  command: string;
  /**
   * 快捷键
   */
  keybinding?: string;
  /**
   * When条件语句
   */
  when?: string;
  /**
   * Context条件语句
   */
  context?: string;
  /**
   * 作用域
   */
  source?: string;
}

export interface IKeymapService {
  /**
   * 设置快捷键
   * @param {KeybindingJson} keybindingJson
   * @returns {Promise<void>}
   * @memberof KeymapsService
   */
  setKeybinding(keybindingJson: KeybindingJson): void;

  /**
   * 移除给定ID的快捷键绑定
   * @param {string} commandId
   * @returns {Promise<void>}
   * @memberof KeymapsService
   */
  removeKeybinding(commandId: string): Promise<void>;

  /**
   * 从keymaps.json获取快捷键列表
   * @returns {Promise<KeybindingJson[]>}
   * @memberof KeymapsService
   */
  getKeybindings(): Promise<KeybindingJson[]>;

  /**
   * 打开快捷键面板
   * @returns {Promise<void>}
   * @memberof IKeymapService
   */
  open(): Promise<void>;

  /**
   * 固定快捷键面板
   * @returns {Promise<void>}
   * @memberof IKeymapService
   */
  fixed(): Promise<void>;
}
