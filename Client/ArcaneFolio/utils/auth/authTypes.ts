import React from 'react'



export type LoginParams = {
    email: string;
    password: string;
    setEmail: React.Dispatch<React.SetStateAction<{value: string, error: string}>>
    setPassword: React.Dispatch<React.SetStateAction<{value: string, error: string}>>
    setToken: React.Dispatch<React.SetStateAction<string>>
    navigation: any
}


export type RegisterParams = LoginParams & {
    name: string;
    confirmPassword: string;
    setName: React.Dispatch<React.SetStateAction<{value: string, error: string}>>
    setConfirmPassword: React.Dispatch<React.SetStateAction<{value: string, error: string}>>
}