import {emailValidator, passwordValidator, nameValidator, checkPasswordMatch} from './validator'

// Handle password and confirm password
export const handlePasswordMatch = (password: string, confirmPassword: string, setConfirmPassword: any) => {
    const error = checkPasswordMatch(password, confirmPassword)
    setConfirmPassword({value: confirmPassword, error: error})
}

// Handle name validate and input change
export const handleNameChange = (text: string, setName: any) => {
  const error = nameValidator(text)
  setName({value: text, error: error})
}

// Handle email validation and input change
export const handleEmailChange = (text: string, setEmail: any) => {
  const error = emailValidator(text)
  setEmail({value: text, error: error})
}

// Handle password validation and input change
export const handlePasswordChange = (text: string, setPassword: any) => {
  const error = passwordValidator(text)
  setPassword({value: text, error: error})
}



// Handle login press(send request to backend, check errors, handle action)
export const handleLogin = (email: string, password: string, navigation: any, setEmail: any, setPassword: any) => {
    const emailError = emailValidator(email)
    const passwordError = passwordValidator(password)

    if(emailError || passwordError){
        setEmail((prev) => ({...prev, error: emailError}))
        setPassword((prev) => ({...prev, error: passwordError}))
        return;
    }

    //Navigate to character selection using navigation.navigate
    navigation.navigate('CharacterSelection') 

  }

  // Handle login press
  export const loginPress = (navigation: any) => { 
    navigation.navigate('Login')
  }

  // Handle Create Account press
  export const handleCreateAccount = (navigation: any) => {
    navigation.navigate('CreateAccount')

  }