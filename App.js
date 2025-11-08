import { StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-web';
import { File, Directory, Paths } from 'expo-file-system';
import { PermissionsAndroid } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as SplashScreen from "expo-splash-screen";

export default function App() {
  //Función de la splash screen
  useEffect(() => {
    SplashScreen.preventAutoHideAsync(); // evita que se oculte el splash screen de forma predeterminada
    setTimeout(() => {
      SplashScreen.hideAsync(); // oculta después de 2s
    }, 3000);
  }, []);
  
  async function requestStoragePermission() {
    try {
      // Source - https://stackoverflow.com/a
      // Posted by Nikitas IO, modified by community. See post 'Timeline' for change history
      // Retrieved 2025-11-07, License - CC BY-SA 4.0

      let StoragePermissions = "granted";
      // The permission exists only for Android API versions bigger than 33 (Android 13),
      // we can assume it's always granted beforehand
      if (Platform.Version >= 33) {
        StoragePermissions = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
          {
            title: "Storage Permission",
            message: "This app needs access to your storage to save photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
      }
      console.log("version de android: " + Platform.Version);
      console.log("Storage Permissions:", StoragePermissions);
    } catch (error) {
      console.error("Error requesting storage permission:", error);
    }
  }


  // variables de expo-camera
  const [facing, setFacing] = useState('back');

  // Solicitar permisos de camara y galeria
  const [permission, requestPermission] = useCameraPermissions();
  //const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  const [foto, setFoto] = useState (null);

  if (!permission) {
    // Camera or media permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  //Cambia la camara de frente a trasera y viceversa
  function cambiarCamara() {
    setFacing( actual => (actual === 'back' ? 'front' : 'back'));
  }

  const onCameraReady = () => {
    console.log('La camara esta lista');
    setIsCameraReady(true);
  }

  const guardarFoto = async  () => {
    if(foto){
      try{
        await MediaLibrary.createAssetAsync(foto.uri);
        alert("Imagen guardada");
        setFoto(null);
      }
      catch(error){
        console.log(e);
      }
    }
  }

  const tomarFoto = async () => {
    if (isCameraReady ) {
      const foto = await cameraRef.current.takePictureAsync();
      setFoto(foto);
      console.log('Foto tomada:', foto.uri);
      //MediaLibrary.saveToLibraryAsync(foto.uri);
      console.log('intentando guardar foto en la galeria');
      guardarFoto();
      // Guardar la foto en el sistema de archivos
      
    }
    else{
      console.log('La camara no esta lista');
    }

    if (!cameraRef.current) {
      console.log('No se tiene referencia de la camara');
      return;
    }

  }

  return (
    <View style={styles.container}>
      <CameraView
        onCameraReady={onCameraReady}
        style={styles.camera}
        facing={facing}
        ref ={cameraRef}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={cambiarCamara}>
          <Text style={styles.text}> Cambiar Camara </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={tomarFoto}>
          <Text style={styles.text}> Tomar Foto </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={requestStoragePermission}>
          <Text style={styles.text}> Solicitar Permiso de Almacenamiento </Text>
        </TouchableOpacity>
        {/* <Button title="Tomar Foto" onPress={tomarFoto}>Tomar Foto</Button> */}
      </View>

      <View>
        {foto && (
          <Image
            source={{ uri: foto.uri }}
            //si no carga la imagen, usar width y height en lugar de flex
            style={{ width: 300, height: 400 }}

          />
        )}

      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    color: '#BD93BD',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
  },
  camera: {
    height: '60%',
    width: '80%',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  button: {
    backgroundColor: '#BD93BD',
    borderRadius: 5,
    padding: 10,
  },
});
