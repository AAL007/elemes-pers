'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import store from '@/lib/store'

export const StoreProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    return <Provider store={store}>{children}</Provider>
}