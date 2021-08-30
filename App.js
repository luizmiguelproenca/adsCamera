import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Modal } from 'react-native'

import { Camera } from 'expo-camera'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'
import { Ionicons } from '@expo/vector-icons'

import Cabecalho from './components/Cabecalho'

export default function App() {
  //referência da câmera
  const cameraRef = useRef(null)
  //status do acesso à câmera
  const [temPermissao, setTemPermissao] = useState(null)
  const [iconePadrao, setIconePadrao] = useState('md')
  //tipo inicial da câmera (front ou back)
  const [tipoCamera, setTipoCamera] = useState(Camera.Constants.Type.back)
  //status incial do flash
  const [tipoFlash, setTipoFlash] = useState(Camera.Constants.FlashMode.off)
  //controle de exibicao do Modal da foto
  const [exibirModalFoto, setExibeModalFoto] = useState(false)
  //referencia à foto capturada
  const [fotoCapturada, setFotoCapturada] = useState(null)

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        const cameraDisponivel = await Camera.isAvailableAsync()
        setTemPermissao(!cameraDisponivel)
      } else {
        const { status } = await Camera.requestCameraPermissionsAsync()
        setTemPermissao(status === 'granted')
      }
    })()
  }, [])

  useEffect(() => {
    //dependendo do SO, exibiremos diferentes icones
    switch (Platform.OS) {
      case 'android':
        setIconePadrao('md')
        break
      case 'ios':
        setIconePadrao('ios')
        break
    }
  }, [])

  if (temPermissao === false) {
    return <Text>Acesso negado à câmera ou o dispositivo não dispõem de uma</Text>
  }

  async function obterResolucoes(){
    let resolucoes = await cameraRef.current.getAvailablePictureSizesAsync("16:9")
    console.log("Resoluções suportadas: " + JSON.stringify(resolucoes))
    if(resolucoes && resolucoes.lenght && resolucoes.lenght > 0){
      console.log(`Maior qualidade: ${resolucoes[resolucoes.lenght - 1]}`)
      console.log(`Meior qualidade: ${resolucoes[0]}`)
    }
  }

   async function tirarFoto(){
     if(cameraRef){
       await obterResolucoes()
       const options = {
         quality: 0.5,
         skipProcessing: true,
         base64: true
       }
       const foto = await cameraRef.current.takePictureAsync(options)
       setFotoCapturada(foto.uri)
       setExibeModalFoto(true)

       let msg = 'Foto tirada com sucesso!'

       switch (Platform.OS) {
        case 'android':
          Alert.alert('Imagem Capturada', msg)
          break
        case 'ios':
          Alert.alert('Imagem Capturada', msg)
          break
        case 'web':
          alert(msg)
      }
     }
   }

  return (
    <SafeAreaView style={styles.container}>
      <Cabecalho titulo="ADS Câmera " />
      <Camera
        style={{ flex: 1 }}
        type={tipoCamera}
        flashMode={tipoFlash}
        ratio={"16:9"}
        ref={cameraRef}>
        <View style={styles.camera}>
          <TouchableOpacity
            style={styles.touch}
            onPress={tirarFoto}
          >
            <Ionicons name={`${iconePadrao}-camera`} size={40} color="#9e9e9e" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touch}
            onPress={() => {
              setTipoCamera(
                tipoCamera === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              )
            }}
          >
            <Ionicons name={`${iconePadrao}-camera-reverse`} size={40} color='#9e9e9e' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touch}
            onPress={() => {
              setTipoFlash(
                tipoFlash === Camera.Constants.FlashMode.on
                  ? Camera.Constants.FlashMode.off
                  : Camera.Constants.FlashMode.on
              )
            }}>
            <Ionicons name={
              tipoFlash === Camera.Constants.FlashMode.on
                ? iconePadrao + "-flash"
                : iconePadrao + "-flash-off"
            } size={40} color="#9e9e9e" />
          </TouchableOpacity>
        </View>
      </Camera>
      <Modal animationType="slide" transparent={true} visible={exibirModalFoto}>
        <View style={styles.modalView}>
          <View style={{ flexDirection: 'row-reverse'}}>
            <TouchableOpacity style={{margin: 2}}
            onPress={() => {
              setExibeModalFoto(false)
            }}
              accessible={true}
              accessibilityLabel="Fechar"
              accessibilityHint="Fecha a janela atual"
            >
              <Ionicons name={`${iconePadrao}-close-circle`} size={40} color="#d9534f"/>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    opacity: 0.95,
    alignItems: "center"
  },

  container: {
    flex: 1,
    justifyContent: 'center'
  },
  
  camera: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  touch: {
    margin: 20
  }
})