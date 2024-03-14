import React from "react";

export default function MapRender({lat,lng}){

  return (
      < iframe src={`//maps.google.com/maps?q=${lat},${lng}&z=4&output=embed`}
        style={{ height: '100%', width: '100%' }}
      ></iframe >
  );
}