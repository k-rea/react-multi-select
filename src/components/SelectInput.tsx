import * as React from "react";
import {memo, useCallback, useEffect, useRef, useState} from "react";
import {useForm, SubmitHandler, UseFormSetValue} from "react-hook-form";
import {
  Box,
  Input,
  Stack,
  Button,
  ResponsiveValue,
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, FormControl, FormLabel,
  InputProps, FormErrorMessage,
} from "@chakra-ui/react";
import {Property} from "csstype";
import Visibility = Property.Visibility;

type PropTypes = InputProps & {
  title: string,
  initData: string[],
  setValue: UseFormSetValue<any>,
  placeholder?: string,
};

type Inputs = {
  label: string,
};

const SelectInput = memo((props: PropTypes) => {
  const {title, initData, placeholder, setValue} = props

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLInputElement>(null)

  const [visibility, setVisibility] = useState<ResponsiveValue<Visibility>>("hidden")
  const [top, setTop] = useState<number>(0)
  const [left, setLeft] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [baseData, setBaseData] = useState<string[]>(initData)
  const [retData, setRetData] = useState<string[]>([])

  const {isOpen, onOpen, onClose} = useDisclosure()
  const {register, handleSubmit, reset, watch, formState: {errors, isSubmitting}} = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = data => {
    console.log(data)
    console.log(
      `^(?!${baseData.join('|')}${baseData.length && retData.length && '|'}${retData.join('|')})`
    )
    setBaseData([...baseData, data.label])
    reset({
      label: '',
    }, {
      keepDirty: false,
      keepIsSubmitted: false,
      keepErrors: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    })
    onClose()
  }

  const onFocus = () => {
    setVisibility("visible")
  }
  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, v: string) => {
    setBaseData(baseData.filter(d => d !== v))
    setRetData([...retData, v])
    !!props.name && setValue(props.name, [...retData, v])
    e.stopPropagation()
  }
  const closeTag = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, v: string) => {
    setBaseData([...baseData, v])
    setRetData(retData.filter(d => d !== v))
    !!props.name && setValue(props.name, (retData.filter(d => d !== v)))
    e.stopPropagation()
  }

  const getNotMatchRegex = useCallback((labelList: string[]) => {
    return labelList.length !== 0
      ? labelList.reduce((acc, v) => acc + `(?!${v}$)`, '^')
      : ".*"
  }, [baseData, retData])

  useEffect(() => {
    if (!!inputRef.current) {
      setTop(inputRef.current.offsetTop)
      setLeft(inputRef.current.offsetLeft)
      setHeight(inputRef.current.offsetHeight)
    }
  }, [inputRef])

  // Eventの登録
  useEffect(() => {
    if (!inputRef.current || !listRef.current) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current?.contains(e.target as Node) || listRef.current?.contains(e.target as Node)) {
        //内側をクリックしたときの処理
      } else {
        //外側をクリックしたときの処理
        console.log('outside', e.target)
        setVisibility("hidden")
      }

    }
    //クリックイベントを設定
    document.addEventListener('click', handleClickOutside)

    //クリーンアップ関数
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [inputRef, listRef])

  const stringToNumber = (s: string) => Array.from(s).map(c => c.charCodeAt(0)).reduce((a, b) => a + b)
  const getHslColor = (s: string) => `hsl(${stringToNumber(s) ^ 2 % 360}, 80%, 64%)`;
  return (
    <>
      <Input
        {...props}
        backgroundColor="gray.200"
        ref={inputRef}
        as="div"
        placeholder={placeholder}
        onFocus={onFocus}
        onInput={props.onChange}
        p={0}
        h="auto"
        w={420}
      >
        {retData.map(data => (
          <Tag
            contentEditable={false}
            marginRight={1}
            backgroundColor={getHslColor(data)}
            color="white"
            marginLeft={1}
            marginBottom={1}
          >
            <TagLabel>
              {data}
            </TagLabel>
            <TagCloseButton onClick={e => closeTag(e, data)}/>
          </Tag>
        ))}
        <Box
          contentEditable
          w="100%"
          h="100%"
          px={2}
          py={1}
        />
      </Input>
      <Stack
        ref={listRef}
        spacing={0}
        position="absolute"
        zIndex={1}
        borderRadius="3px"
        boxShadow={'0 1px 1px 0 rgba(0, 0, 0, .5)'}
        borderColor='gray.200'
        top={0}
        left={0}
        visibility={visibility}
        transform={`translate(${left}px,${top + height + 10}px)`}
        paddingY={1}
      >
        {baseData.map(v => (
          <Button
            key={v}
            // variant='ghost'
            backgroundColor='white'
            justifyContent="flex-start"
            borderRadius={0}
            fontWeight="normal"
            onClick={(e) => onButtonClick(e, v)}
          >
            {v}
          </Button>
        ))}
        <Button
          backgroundColor="gray.50"
          justifyContent="flex-start"
          borderRadius={0}
          fontWeight="normal"
          color="gray.400"
          onClick={onOpen}
        >
          新規作成
        </Button>
      </Stack>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay/>
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>{title} 新規作成</ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.label}>
                <FormLabel htmlFor='label'>{title}</FormLabel>
                <Input
                  id='label'
                  {...register('label', {
                    required: '必須入力です',
                    pattern: {
                      value: new RegExp(getNotMatchRegex([...baseData, ...retData])),
                      message: '登録済みです'
                    }
                  })}
                  placeholder={title}
                />
                <FormErrorMessage>
                  {errors.label && errors.label.message}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='teal' isLoading={isSubmitting} type='submit' marginRight={1}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
});
SelectInput.displayName = 'SelectInput'
export default SelectInput;
