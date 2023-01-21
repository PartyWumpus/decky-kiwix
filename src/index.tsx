import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
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

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  const [installed, setInstalled] = useState({});

  return (
    <PanelSection title="test menu">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/kiwix-nav"); }} >
          Manage Books
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
      <ButtonItem
          layout="below"
          onClick={(e) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL">
                <MenuItem>Item #1</MenuItem>
                <MenuItem>Item #2</MenuItem>
                <MenuItem>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says yolo
        </ButtonItem>
        </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            python.startServe();
            setTimeout(() => {
              Router.CloseSideMenus();
              Router.NavigateToExternalWeb("localhost:60918/");
          }, 1000); // gives time for server to start, will make better later i pinky promise
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
