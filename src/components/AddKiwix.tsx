import { Fragment, useState, useEffect } from "react";
import { Focusable, ButtonItem, Dropdown, TextField } from "decky-frontend-lib";
import * as python from "../python";

export function AddKiwix() {
    const [downloads, setDownloads] = useState({});
    const [zims, setZims] = useState([]); // format = {title, language, category, description, image, metalink, size, images, videos}
    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);

    const [language, setLanguage] = useState<string>('all');
    const [category, setCategory] = useState<string>('all');
    const [search, setSearch] = useState<string>(' ');

    //useEffect(() => {
    //python.resolve(python.getCategories(), (data: string[]) => {setCategories(data)});
    //python.resolve(python.getLanguages(), (data: string[]) => {setLanguages(data)});
    //});


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
        <span>{JSON.stringify(downloads)}</span>
        <ButtonItem
          layout="below"
          onClick={async() => {
                python.resolve(python.getCategories(), (data: string[]) => {setCategories(data)});
                python.resolve(python.getLanguages(), (data: string[]) => {setLanguages(data)});
            } }
        >
          Refresh
        </ButtonItem>
        <br/>
        <div style={{ width: '100%' }}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />

        <ButtonItem
          layout="below"
          onClick={async() => {
              python.resolve(python.getZims(language, category, search), (zims: object[]) => {setZims(zims)});
            } }
        >
          Search
        </ButtonItem>
        </div>

        <Dropdown
        rgOptions={languages.map((lang) => ({
            label: lang,
            data: lang,
          }))}
        selectedOption={language}
        menuLabel="Language"
        onChange={async(newVal) => {await setLanguage(newVal.data);}}
      />
        <Dropdown
        rgOptions={categories.map((lang) => ({
            label: lang,
            data: lang,
          }))}
        selectedOption={category}
        menuLabel="Category"
        onChange={async(newVal) => {await setCategory(newVal.data);}}
      />
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
