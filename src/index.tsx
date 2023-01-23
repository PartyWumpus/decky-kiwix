import {
  ButtonItem,
  definePlugin,
  DialogButton,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  Dropdown,
  staticClasses,
  SidebarNavigation,
  SteamSpinner
} from "decky-frontend-lib";

import { VFC, Suspense, useState, useEffect, Fragment } from "react";
import { FaShip } from "react-icons/fa";

import { About } from "./components/About";
import { AddKiwix } from "./components/AddKiwix";
import { ManageKiwix } from "./components/ManageKiwix";
import * as python from "./python";

enum UpdateBranch {
  Stable,
  Prerelease,
  Testing,
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  const [installed, setInstalled] = useState({});
  const [option, setOption] = useState<number>();

  return (
    <PanelSection title="test menu">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/kiwix-nav"); }} >
          Manage Books
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { setOption(2); }} >
          owo
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
      <Dropdown
        rgOptions={Object.values(UpdateBranch)
          .filter((branch) => typeof branch == 'string')
          .map((branch) => ({
            label: branch,
            data: UpdateBranch[branch],
          }))}
        selectedOption={option}
        onChange={async(newVal) => {
          console.log('switching branches!');console.log(newVal.data);console.log(option);
          await setOption(newVal.data);
          setTimeout(() => {console.log(option);}, 1500)}}
      />
      </PanelSectionRow>

      <PanelSectionRow>
      <>
      <span>{option}</span>
      <span>{UpdateBranch[option]}</span>
      </>
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
    alwaysRender: true,
  };
});
