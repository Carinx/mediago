import { inject, injectable } from "inversify";
import { TYPES } from "../types.ts";
import isDev from "electron-is-dev";
import install, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import ElectronLogger from "./ElectronLogger.ts";
import { Vendor } from "../core/vendor.ts";

@injectable()
export default class DevToolsService implements Vendor {
  constructor(
    @inject(TYPES.ElectronLogger)
    private readonly logger: ElectronLogger,
  ) {}

  async init() {
    if (!isDev) {
      return;
    }
    // 开发环境中可以通过设置环境变量来控制是否加载开发者工具
    if (!process.env.LOAD_DEVTOOLS) {
      return;
    }

    try {
      this.logger.debug("当前环境为开发环境，开始加载开发者工具");
      await install([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
      this.logger.debug("加载开发者工具成功");
    } catch (err: unknown) {
      this.logger.error("加载开发者工具失败", err);
    }
  }
}
