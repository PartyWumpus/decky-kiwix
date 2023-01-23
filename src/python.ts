// Code taken from https://github.com/NGnius/PowerTools/blob/dev/src/python.ts

import { ServerAPI } from "decky-frontend-lib";

var server: ServerAPI | undefined = undefined;

export function resolve(promise: Promise<any>, setter: any) {
    (async function () {
        let data = await promise;
        if (data.success) {
            console.debug("Got resolved", data, "promise", promise);
            setter(data.result);
        } else {
            console.warn("Resolve failed:", data, "promise", promise);
        }
    })();
}

export function execute(promise: Promise<any>) {
    (async function () {
        let data = await promise;
        if (data.success) {
            console.debug("Got executed", data, "promise", promise);
        } else {
            console.warn("Execute failed:", data, "promise", promise);
        }

    })();
}

export function setServer(s: ServerAPI) {
  server = s;
}

export function downloadFile(metalink:string): Promise<any> {
  return server!.callPluginMethod("frontend_download_file", {"metalink": metalink});
}

export function startServe(): Promise<any> {
  return server!.callPluginMethod("frontend_host_library", {});
}

export function stopServe(): Promise<any> {
  return server!.callPluginMethod("frontend_kill_library", {});
}


export function getDownloads(metalink:string): Promise<any> {
  return server!.callPluginMethod("frontend_download_progress", {"metalink":metalink});
}

export function getZims(language:string = 'all', category:string = 'all', search:string = ""): Promise<any> {
  return server!.callPluginMethod("frontend_find_zims", {"language":language, "category":category, "search":search});
}

export function getCategories(): Promise<any> {
  return server!.callPluginMethod("frontend_get_categories", {});
}

export function getLanguages(): Promise<any> {
  return server!.callPluginMethod("frontend_get_languages", {});
}

