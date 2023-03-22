import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils, CoreConfig,
  //types:
  ZipConfig
} from "@react-awesome-query-builder/core";
import { Session, withSessionRoute, getSessionData, saveSessionData } from "../../lib/withSession";
import serverConfig from "../../lib/config";

// API to get/save `zipConfig` to session
// Initial config is created from `lib/config` (based on `CoreConfig`) and compressed with `compressConfig`

export interface PostConfigBody {
  zipConfig: ZipConfig;
};
export interface PostConfigResult {
}
export interface GetConfigResult {
  zipConfig: ZipConfig;
}


export async function getSavedConfig(req: NextApiRequest): Promise<ZipConfig> {
  return getSessionData(req.session).zipConfig || getInitialConfig();
}

export function getInitialConfig() {
	return Utils.ConfigUtils.compressConfig(serverConfig, CoreConfig);
}

async function saveConfig(session: Session, zipConfig: ZipConfig) {
	await saveSessionData(session, { zipConfig });
}

async function post(req: NextApiRequest, res: NextApiResponse<PostConfigResult>) {
  const { zipConfig } = JSON.parse(req.body as string) as PostConfigBody;
  await saveConfig(req.session, zipConfig);
  const result: PostConfigResult = {};
  return res.status(200).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse<GetConfigResult>) {
  const zipConfig = await getSavedConfig(req);
  const result: GetConfigResult = {
    zipConfig
  };
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return post(req, res);
  } else if (req.method === "GET") {
    return get(req, res);
  } else {
    return res.status(400).end();
  }
}

export default withSessionRoute(route);
