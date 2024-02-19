import winax from 'winax';
import fs from 'fs';
import path from 'path';
// import * as util from "util";
// import * as path from "path";

var app = new winax.Object("Photoshop.Application", { activate: true });
var descriptor = new winax.Object("Photoshop.ActionDescriptor", { activate: true });
var pngOptions = new winax.Object("Photoshop.PNGSaveOptions", { activate: true });

const replaceImage =  async (imageData, name) => {
  const ifSaved = await saveInputImagefile(imageData);
  if(!ifSaved) {
    const value = {
      ifSuccess: false,
      reason: "Input imageData error."
    } 
    return value;
  }
  
  try {
    //const psd_api = app.Open(path.resolve("sample1.psd"));
    //console.log(path.resolve(`mockupfiles/psd/${group} (${filename}).psd`))
    const psd_api = app.Open(path.resolve(`mockupfiles/psd/${name}.psd`));

    //console.log(psd_api)
    //const layer = psd_api.Layers["Change"];
    if(!psd_api) {
      const value = {
        ifSuccess: false,
        reason: "Error: open psd."
      } 
      return value;
    }

    const layer = psd_api.Layers["mm_img:Your Image"];
    //layer.visible = true;
    select_layer("mm_img:Your Image");

    var idplacedLayerReplaceContents = app.stringIDToTypeID( "placedLayerReplaceContents" );
    // var idplacedLayerReplaceContents = app.stringIDToTypeID( "revealAll" );
    
    var idnull = app.charIDToTypeID( "null" );

    const file = path.resolve('Input.jpg');
    descriptor.putPath(idnull, file);
    // console.log(file)

    const ss = app.executeAction(idplacedLayerReplaceContents, descriptor);

    //psd_api.saveAs(path.resolve("replacedImage"));
    psd_api.saveAs(path.resolve('result_origin.png'), pngOptions, true, 2);
    //docRef.close(SaveOptions.DONOTSAVECHANGES);


    psd_api.Close(2);
    const value = {
      ifSuccess: true,
      reason: "Successfully rendered."
    } 
    return value;

  } catch (err) {
    //psd_api.Close()
    console.log(err);
    const value = {
      ifSuccess: false,
      reason: "Error: render image."
    } 
    return value;
  }
};

const select_layer = async (id, add, viz) =>
{  
  console.log("select =")
  try {
    var d = new winax.Object("Photoshop.ActionDescriptor", { activate: true });

    if (viz == undefined) viz = false;

    var r = new winax.Object("Photoshop.ActionReference", { activate: true });

    if (typeof(id) == "string") r.putName( app.charIDToTypeID( "Lyr " ), id);
    else                        r.putIdentifier( app.charIDToTypeID( "Lyr " ), id);

    d.putReference( app.charIDToTypeID( "null" ), r );

    d.putBoolean( app.charIDToTypeID( "MkVs" ), viz );

    if (add == true) d.putEnumerated( app.stringIDToTypeID( "selectionModifier" ), app.stringIDToTypeID( "selectionModifierType" ), app.stringIDToTypeID( "addToSelection" ) );
    if (add == -1)   d.putEnumerated( app.stringIDToTypeID( "selectionModifier" ), app.stringIDToTypeID( "selectionModifierType" ), app.stringIDToTypeID( "removeFromSelection" ) );

    var ok = true;

    try { app.executeAction( app.charIDToTypeID( "slct" ), d); } 
    catch(e) { 
      console.log("execute === ", e)
      ok = false; 
    }

    d = null;

    return ok;
  }
  catch (e) {
    console.log("select === ", e);
  }
}

const saveInputImagefile =  async (imageData) => {
  try{
    //console.log(imageData);
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    
    const buffer = Buffer.from(base64Data, 'base64');

    // Save the image file
    const imagePath = path.join(path.resolve('Input.jpg'));
    //console.log(buffer);
    //console.log(imagePath)
    fs.writeFileSync(imagePath, buffer);
    return true;
  } catch (err){
    return false;
  }
}
    

export default replaceImage;

// const output = fs.createWriteStream('1.txt');
// import { Console } from "console";
// const logger = new Console({ stdout: output });
// logger.log(app);
// output.end();
