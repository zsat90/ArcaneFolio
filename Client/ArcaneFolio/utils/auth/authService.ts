import auth from '@react-native-firebase/auth'

export const login = async (email: string, password: string) => {
    try {
        await auth().signInWithEmailAndPassword(email, password)
    } catch (error) {
        console.error(error)
    }
}


export const signup = async (email: string, password: string) => {
    try {
        await auth().createUserWithEmailAndPassword(email, password)
    } catch (error) {
        console.error(error)
    }
}

export const getIdToken = async () => {
    const currentUser = auth().currentUser;
    return currentUser ? await currentUser.getIdToken() : null;
  };