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
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaShip } from "react-icons/fa";

import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  // const [result, setResult] = useState<number | undefined>();

  // const onClick = async () => {
  //   const result = await serverAPI.callPluginMethod<AddMethodArgs, number>(
  //     "add",
  //     {
  //       left: 2,
  //       right: 2,
  //     }
  //   );
  //   if (result.success) {
  //     setResult(result.result);
  //   }
  // };

  return (
    <PanelSection title="test menu">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {serverAPI!.callPluginMethod("frontend_host_library", {});}}
        >
          Start Server
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {serverAPI!.callPluginMethod("frontend_download_file", {metalink: "https://download.kiwix.org/zim/other/archlinux_en_all_nopic_2022-12.zim.meta4"});}}
        >
          Download Archwiki
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
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

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>Decky Kiwix</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
  };
});
