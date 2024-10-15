import validator from 'validator'

export const checkPasswordMatch = (password: string, confirmPassword: string) => {
    if(!password || !confirmPassword) return 'Password and Confirm Password cannot be empty'
    if(password !== confirmPassword) return 'Passwords do not match'
    return '';
}

export const nameValidator = (name: string) => {
    if(!name || name.length <= 0) return 'Name cannot be empty'
    return '';
}


export const emailValidator = (email: string) => {
    if(!email || email.length <= 0) return 'Email cannot be empty';
    if(!validator.isEmail(email)) return 'Need a valid Email';

    return '';
}

export const passwordValidator = (password: string) => {
    const validationRules = [
        { 
            regex: /.{8,}/, 
            message: 'Password must be at least 8 characters long' 
        },
        { 
            regex: /[A-Z]/, 
            message: 'Password must contain at least one uppercase letter' 
        },
        { 
            regex: /[0-9]/, 
            message: 'Password must contain at least one number' 
        },
        { 
            regex: /[!@#$%^&*]/, 
            message: 'Password must contain at least one special character' 
        }
    ]
    if(!password || password.length <= 0) return 'Password cannot be empty'

    for(const {regex, message} of validationRules){
        if(!regex.test(password)) {
            return message
        }
    }
    

    return '';
}