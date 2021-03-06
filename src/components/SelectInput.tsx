import * as React from "react";
import {ChangeEvent, memo, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
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
  const [topLeft, setTopLeft] = useState<{ top: number, left: number }>({top: 0, left: 0})
  const [height, setHeight] = useState<number>(0)
  const [baseData, setBaseData] = useState<string[]>(initData)
  const [retData, setRetData] = useState<string[]>([])
  const [regexExp, setRegexExp] = useState<RegExp | string>('')

  const {isOpen, onOpen, onClose} = useDisclosure()
  const {register, handleSubmit, reset, watch, formState: {errors, isSubmitting}} = useForm<Inputs>();

  const createOptionSubmit: SubmitHandler<Inputs> = data => {
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

  const selectTagClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, v: string) => {
    setBaseData(baseData.filter(d => d !== v))
    setRetData([...retData, v])
    !!props.name && setValue(props.name, [...retData, v])
    e.stopPropagation()
  }

  const filterTag = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value === '') {
      setRegexExp('')
    } else {
      setRegexExp(new RegExp(`.*${e.currentTarget.value}.*`))
    }
  }

  const removeSelectedTag = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, v: string) => {
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

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!!inputRef.current) {
        setTopLeft({top: inputRef.current.offsetTop, left: inputRef.current.offsetLeft})
        setHeight(inputRef.current.offsetHeight)
      } else {
        return
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [inputRef])

  useEffect(() => {
    if (!!inputRef.current) {
      setTopLeft({top: inputRef.current.offsetTop, left: inputRef.current.offsetLeft})
      setHeight(inputRef.current.offsetHeight)
    }
  }, [inputRef])

  // Event?????????
  useEffect(() => {
    if (!inputRef.current || !listRef.current) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current?.contains(e.target as Node) || listRef.current?.contains(e.target as Node)) {
        //??????????????????????????????????????????
        setVisibility("visible")
      } else {
        //??????????????????????????????????????????
        setVisibility("hidden")
      }

    }
    //?????????????????????????????????
    document.addEventListener('click', handleClickOutside)

    //???????????????????????????
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [inputRef, listRef])

  const getHslColor = (s: string) => `hsl(${Array.from(s).map(c => c.charCodeAt(0)).reduce((a, b) => a + b) ^ 2 % 360}, 80%, 64%)`;
  return (
    <>
      <Input
        as='div'
        backgroundColor="gray.200"
        ref={inputRef}
        h="auto"
        p={0}
      >
        <Box
          {...props}
          placeholder={placeholder}
          p={0}
        >
          {retData.map(data => (
            <Tag
              key={data}
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
              <TagCloseButton onClick={e => removeSelectedTag(e, data)}/>
            </Tag>
          ))}
        </Box>
        <Input
          w="100%"
          h="100%"
          onChange={filterTag}
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
        transform={`translate(${topLeft.left}px,${topLeft.top + height + 10}px)`}
        paddingY={1}
      >
        {baseData.filter(v=> v.match(regexExp)).map(v => (
          <Button
            key={v}
            // variant='ghost'
            backgroundColor='white'
            justifyContent="flex-start"
            borderRadius={0}
            fontWeight="normal"
            onClick={(e) => selectTagClick(e, v)}
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
          ????????????
        </Button>
      </Stack>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay/>
        <ModalContent>
          <form onSubmit={handleSubmit(createOptionSubmit)}>
            <ModalHeader>{title} ????????????</ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.label}>
                <FormLabel htmlFor='label'>{title}</FormLabel>
                <Input
                  id='label'
                  {...register('label', {
                    required: '??????????????????',
                    pattern: {
                      value: new RegExp(getNotMatchRegex([...baseData, ...retData])),
                      message: '??????????????????'
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
