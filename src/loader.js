"use strict";

import includeAll from "include-all";
import inflect from "inflect";

class Loader {
  constructor(settings) {
    this.type = settings.type;
    this.filter = settings.filter || this._getDefaultFilter();
    this.loadPath = settings.path;
    this.modules = this._loadModules();
  }

  get(name) {
    return this.modules[name];
  }

  _getFilter(filter) {
    filter = filter || this._getDefaultFilterString();

    return new RegExp(filter, "i");
  }

  _getDefaultFilterString() {
    return `(.+)${this.type}\\.js$`;
  }

  _getDefaultFilter() {
    return this._getFilter();
  }

  _loadModules() {
    const modules = includeAll({
      dirname: this.loadPath,
      filter: this.filter
    });

    Object.keys(modules).forEach(module => {
      const moduleName = module.toLowerCase().replace("_", "").replace("-", "");
      const key = inflect.singularize(moduleName);

      if (modules[module].hasOwnProperty("default")) {
        /**
         * HACK: Babel no longer exports [default], though I'm pretty sure I have
         * that transform installed so....¯\_(ツ)_/¯
         */
        modules[key] = modules[module].default;
      } else {
        modules[key] = modules[module];
      }

      delete modules[module];
    });

    return modules;
  }
}

export default Loader;
