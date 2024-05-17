import React from "react";

import { Uppy } from "@uppy/core";
import Webcam from "@uppy/webcam";
import { Dashboard } from "@uppy/react";

const uppy = new Uppy().use(Webcam);

const UppyComponent = ({ open }: { open: boolean }) => {
  console.log("UppyComponent", open);
  return <Dashboard uppy={uppy} plugins={["Webcam"]} />;
};

export default UppyComponent;
