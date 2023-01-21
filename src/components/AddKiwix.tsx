import { Fragment, useState, useEffect } from "react";
import { Focusable, ButtonItem, showContextMenu, Menu, MenuItem } from "decky-frontend-lib";
import * as python from "../python";

export function AddKiwix() {
    const [downloads, setDownloads] = useState({});
    const [zims, setZims] = useState([]); // format = {title, language, category, description, image, metalink, size, images, videos}
    const [searchPerams, setSearchPerams] = useState({language:'all', category:'all', search:"_Empty"});
    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);

    useEffect(() => {
    // Update the document title using the browser API
    python.resolve(python.getCategories(), (data: string[]) => {setCategories(data)});
    python.resolve(python.getLanguages(), (data: string[]) => {setLanguages(data)});
    });


    return (
        <>
        <Focusable
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: "5px",
          columnGap: "5px",
        }}
        >
        <ButtonItem
          layout="below"
          onClick={async() => {
              python.resolve(python.getZims(searchPerams.language, searchPerams.category, searchPerams.search), (zims: object[]) => {setZims(zims)});
            } }
        >
          Refresh {searchPerams.language} {searchPerams.category} {searchPerams.search}
        </ButtonItem>
        <br />
        <ButtonItem
          layout="below"
          onClick={(e) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => {}}>
                <MenuItem onSelected={() => {}}>Item #1</MenuItem>
                <MenuItem onSelected={() => {}}>Item #2</MenuItem>
                <MenuItem onSelected={() => {}}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says yolo
        </ButtonItem>
        <br />
         {zims ? zims.map((e) => (
        <Focusable
        style={{
            backgroundColor: "#090909EE",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "45%",
            height: "170px",
            borderRadius: "5px",
          }}
            >
        <div
            className="CssLoader_ThemeBrowser_SingleItem_BgOverlay"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "RGBA(0,0,0,0.8)",
              backdropFilter: "blur(5px)",
              width: "100%",
              height: "100%",
              borderRadius: "3px",
            }}
          >
        <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeName" // this is temporarily stolen from CSS loader while i figure stuff out
              style={{
                textAlign: "center",
                marginTop: "5px",
                fontSize: "1.25em",
                fontWeight: "bold",
                // This stuff here truncates it if it's too long
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "90%",
              }}
            >
              {e.title}
        </span>
        <span>{e.description}</span>
        <span>{e.size}</span>
        <ButtonItem
          layout="below"
          onClick={async() => {
            python.execute(python.downloadFile(e.metalink));
            const interval = setInterval(async() => {
              python.resolve(python.getDownloads(e.metalink), (percent: number) => {setDownloads({...downloads,[e.metalink]:percent});if (percent == 100) clearInterval(interval);});
            }, 500);
            } }
        >
            Download {downloads[e.metalink] ? downloads[e.metalink]+"%" : ""}
        </ButtonItem>
        </div>
        </Focusable>
        )) : "nothing yet"}
            <div>This is the store page where you can download ZIM files listed at https://library.kiwix.org (files are downloaded via mirrors) </div>
        </Focusable>
        </>
    )
}
