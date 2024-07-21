'use client'
import { supabase } from "../../lib/supabase"
export default function Page(){
    // let setNewView = async() => {
    //     console.log('Hello World')

    //     const {data, error} = await supabase
    //         .from("views")
    //         .insert({
    //             name: 'random name'
    //         })
    // }

    // setNewView()

    return <p>Dashboard Page</p>
}
