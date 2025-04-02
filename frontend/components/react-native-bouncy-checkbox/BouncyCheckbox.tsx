// cloned from https://github.com/WrathChaos/react-native-bouncy-checkbox to customize the checkbox
import React, {
  forwardRef,
  RefAttributes,
  useCallback,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  SetStateAction
} from 'react'
import { View, Text, Image, Animated, Pressable } from 'react-native'
import useBounceAnimation from './useBounceAnimation'
import styles from './BouncyCheckbox.style'
import { AnimationValues, BouncyCheckboxHandle, BouncyCheckboxProps } from './BouncyCheckbox.type'

type Callback<T> = (value?: any) => void
type DispatchWithCallback<T> = (value: any, callback?: Callback<any>) => void

function useStateWithCallback<T>(initialState: any | (() => any)): [any, DispatchWithCallback<SetStateAction<any>>] {
  const [state, _setState] = useState(initialState)

  const callbackRef = useRef<Callback<any>>()
  const isFirstCallbackCall = useRef<boolean>(true)

  const setState = useCallback((setStateAction: SetStateAction<any>, callback?: Callback<any>): void => {
    callbackRef.current = callback
    _setState(setStateAction)
  }, [])

  useEffect(() => {
    if (isFirstCallbackCall.current) {
      isFirstCallbackCall.current = false
      return
    }
    callbackRef.current?.(state)
  }, [state])

  return [state, setState]
}

const BouncyCheckbox: React.ForwardRefRenderFunction<
  BouncyCheckboxHandle,
  BouncyCheckboxProps & RefAttributes<BouncyCheckboxHandle>
> = (props, ref) => {
  const {
    style,
    iconStyle,
    iconComponent,
    iconImageStyle,
    innerIconStyle,
    text,
    textComponent,
    textStyle,
    textContainerStyle,
    testID,
    size = 25,
    onPress,
    onLongPress,
    fillColor = '#ffc484',
    ImageComponent = Image,
    unFillColor = 'transparent',
    disableText = false,
    isChecked = undefined,
    checkIconImageSource = require('./check.png'),
    bounceEffectIn = AnimationValues.BounceIn,
    bounceEffectOut = AnimationValues.BounceOut,
    bounceVelocityIn = AnimationValues.VelocityIn,
    bounceVelocityOut = AnimationValues.VelocityOut,
    bouncinessIn = AnimationValues.BouncinessIn,
    bouncinessOut = AnimationValues.BouncinessOut,
    TouchableComponent = Pressable,
    useBuiltInState = true,
    ...rest
  } = props

  const [checked, setChecked] = useStateWithCallback(isChecked || false)

  const { bounceAnimation, syntheticBounceAnimation, bounceValue } = useBounceAnimation()

  useEffect(() => {
    setChecked(isChecked || false)
  }, [isChecked, setChecked])

  const onCheckboxPress = useCallback(() => {
    if (!useBuiltInState) {
      syntheticBounceAnimation(bounceEffectIn, bounceEffectOut, bounceVelocityOut, bouncinessOut)
      onPress?.(isChecked ?? false)
      return
    }

    setChecked(!checked, (newCheckedValue) => {
      syntheticBounceAnimation(bounceEffectIn, bounceEffectOut, bounceVelocityOut, bouncinessOut)
      onPress && onPress(newCheckedValue)
    })
  }, [
    useBuiltInState,
    setChecked,
    checked,
    syntheticBounceAnimation,
    bounceEffectIn,
    bounceEffectOut,
    bounceVelocityOut,
    bouncinessOut,
    onPress,
    isChecked
  ])

  const onCheckboxLongPress = useCallback(() => {
    if (!onLongPress) {
      return
    }

    if (!useBuiltInState) {
      onLongPress && onLongPress(isChecked ?? false)
      return
    }

    setChecked(!checked, (newCheckedValue) => {
      onLongPress && onLongPress(newCheckedValue)
    })
  }, [checked, onLongPress, setChecked, useBuiltInState])

  useImperativeHandle(ref, () => ({ onCheckboxPress, onCheckboxLongPress }), [onCheckboxPress, onCheckboxLongPress])

  const renderCheckIcon = () => {
    const scaleAnimation = { transform: [{ scale: bounceValue }] }
    return (
      <Animated.View style={[scaleAnimation, styles.iconContainer(size, checked, fillColor, unFillColor), iconStyle]}>
        <View style={[styles.innerIconContainer(size, fillColor), innerIconStyle]}>
          {iconComponent ||
            (checked && (
              <ImageComponent source={checkIconImageSource} style={[styles.iconImageStyle, iconImageStyle]} />
            ))}
        </View>
      </Animated.View>
    )
  }

  const renderCheckboxText = () => {
    const checkDisableTextType = typeof disableText === 'undefined'
    return (
      (!disableText || checkDisableTextType) &&
      (textComponent || (
        <View style={[styles.textContainer, textContainerStyle]}>
          <Text style={[styles.textStyle(checked), textStyle]}>{text}</Text>
        </View>
      ))
    )
  }

  return (
    <TouchableComponent
      testID={testID}
      style={[styles.container, style]}
      onPressIn={() => {
        bounceAnimation(bounceEffectIn, bounceVelocityIn, bouncinessIn)
      }}
      onPressOut={() => {
        bounceAnimation(bounceEffectOut, bounceVelocityOut, bouncinessOut)
      }}
      onPress={onCheckboxPress}
      onLongPress={onCheckboxLongPress}
      {...rest}
    >
      {renderCheckIcon()}
      {renderCheckboxText()}
    </TouchableComponent>
  )
}

export default forwardRef(BouncyCheckbox)
