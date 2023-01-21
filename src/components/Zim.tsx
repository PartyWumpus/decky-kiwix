import { Fragment, VFC } from "react";
import * as python from "../python";

export const VariableSizeCard: VFC<{
  data: number;
}> = ({
  data: e,
}) => {
return (
    // The outer 2 most divs are the background darkened/blurred image, and everything inside is the text/image/buttons
    <>
      <div style={{ position: "relative" }}>{{e}}</div>
    </>
  );
}
