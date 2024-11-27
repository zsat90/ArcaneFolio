import {nameValidator, emailValidator, passwordValidator, inputValidator} from "../Validation/validator"

// Handle name validate and input change
export const handleNameChange = (text: string, setName: any) => {
    const error = nameValidator(text);
    setName({ value: text, error: error });
  };
  
  // Handle email validation and input change
  export const handleEmailChange = (text: string, setEmail: any) => {
    const error = emailValidator(text);
    setEmail({ value: text, error: error });
  };
  
  // Handle password validation and input change
  export const handlePasswordChange = (text: string, setPassword: any) => {
    const error = passwordValidator(text);
    setPassword({ value: text, error: error });
  };

  // Handle generic input validation
  export const handleMagicPointChange = (text: string, setMagicPoints: any) => {
    const parsedText = Number(text);
    let error = "";
  
    if (isNaN(parsedText)) {
      error = "Please enter a valid number.";
    } else {
      error = inputValidator(parsedText);
    }
  
    setMagicPoints({
      value: isNaN(parsedText) ? "" : parsedText,
      error,
    });
  };

