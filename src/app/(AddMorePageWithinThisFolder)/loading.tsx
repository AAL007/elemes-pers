import React from "react";
import { Spinner } from "@nextui-org/react";

const Loading = () =>{
    return(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
            <Spinner size="lg" color='primary'/>
        </div>
    )
}

export default Loading;