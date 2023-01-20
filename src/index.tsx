import {
  ButtonItem,
  definePlugin,
  DialogButton,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  staticClasses,
  SidebarNavigation,
  SteamSpinner,
} from "decky-frontend-lib";
import { VFC, Suspense, useState, useEffect } from "react";
import { FaShip } from "react-icons/fa";

import { About } from "./components/About";
import { AddKiwix } from "./components/AddKiwix";
import { ManageKiwix } from "./components/ManageKiwix";
import * as python from "./python";



// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
   const [downloads, setDownloads] = useState({});



  return (
    <PanelSection title="test menu">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={async() => {
            python.execute(python.downloadFile('https://download.kiwix.org/zim/other/archlinux_en_all_nopic_2022-12.zim.meta4'));
            const interval = setInterval(async() => {
              python.resolve(python.getDownloads('https://download.kiwix.org/zim/other/archlinux_en_all_nopic_2022-12.zim.meta4'), (percent: number) => {setDownloads({...downloads,['https://download.kiwix.org/zim/other/archlinux_en_all_nopic_2022-12.zim.meta4']:percent});if (percent == 100) clearInterval(interval);});
            }, 200);
            } }
        >
          Download Archwiki {downloads['https://download.kiwix.org/zim/other/archlinux_en_all_nopic_2022-12.zim.meta4'] ?? ""}
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={async() => {
            python.execute(python.downloadFile('https://download.kiwix.org/zim/wikipedia/wikipedia_en_100_nopic_2022-12.zim.meta4'));
            const interval = setInterval(async() => {
              python.resolve(python.getDownloads('https://download.kiwix.org/zim/wikipedia/wikipedia_en_100_nopic_2022-12.zim.meta4'), (percent: number) => {setDownloads({...downloads,['https://download.kiwix.org/zim/wikipedia/wikipedia_en_100_nopic_2022-12.zim.meta4']:percent});if (percent == 100) clearInterval(interval);});
            }, 200);
            } }
        >
          Download Wikipedia 100 {downloads['https://download.kiwix.org/zim/wikipedia/wikipedia_en_100_nopic_2022-12.zim.meta4'] ?? ""}
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
      <ButtonItem>
        {JSON.stringify(downloads) ?? "nothing yet"}
      </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={async() => {serverAPI!.callPluginMethod("arbitrary_log", {});} }
        >
          Test Button
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/kiwix-nav"); }} >
          Manage Books
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            serverAPI!.callPluginMethod("frontend_host_library", {});
            Router.CloseSideMenus();
            Router.NavigateToExternalWeb("localhost:60918/");
          }}
        >
          View Library
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const KiwixManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title="Kiwix Manager"
      showTitle
      pages={[
        {
          title: "Download New Books",
          content: <AddKiwix />,
          route: "/kiwix-nav/add",
        },
        {
          title: "Manage Books",
          content: <ManageKiwix />,
          route: "/kiwix-nav/manage",
        },
        {
          title: "About Decky Kiwix",
          content: <About />,
          route: "/kiwix-nav/about",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {

  python.setServer(serverApi);

  serverApi.routerHook.addRoute("/kiwix-nav", KiwixManagerRouter,  () => {
    return (
      <Suspense
        fallback={
          <div
            style={{
              marginTop: "40px",
              height: "calc( 100% - 40px )",
              overflowY: "scroll",
            }}
          >
            <SteamSpinner />
          </div>
        }
      >
        <KiwixManagerRouter />
      </Suspense>
    );
  });

  return {
    title: <div className={staticClasses.Title}>Decky Kiwix</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
  };
});
