import {emailValidator, passwordValidator} from './validator'



// Handle login press(send request to backend, check errors, handle action)
export const handleLogin = (email: string, password: string, navigation: any, setEmail: any, setPassword: any) => {
    const emailError = emailValidator(email)
    const passwordError = passwordValidator(password)

    if(emailError || passwordError){
        setEmail((prev) => ({...prev, error: emailError}))
        setPassword((prev) => ({...prev, error: passwordError}))
        return;
    }

    //Navigate to dashboard using navigation.navigate
    navigation.navigate('Dashboard')

  }

  // Handle Create Account press
  export const handleCreateAccount = (navigation: any) => {
    navigation.navigate('CreateAccount')

  }