import { FC, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';

import {
  Button,
  Card,
  FormInput,
  FormSelect,
  Icon,
  Switch,
  Track,
} from 'components';
import { WidgetConfig } from 'types/widgetConfig';
import { useToast } from 'hooks/useToast';
import bykLogo from 'assets/logo-white.svg';
import './SettingsAppearance.scss';
import clsx from 'clsx';
import { apiDev } from 'services/api';
import { ChromePicker } from 'react-color';
import { MdOutlinePalette } from 'react-icons/md';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';

const variants = {
  initial: {
    y: 100,
  },
  animate: {
    y: 0,
  },
};

const SettingsAppearance: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const hasRendered = useRef<boolean>();
  const { register, control, handleSubmit, reset, setValue } =
    useForm<WidgetConfig>();
  const [showPreview, setShowPreview] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [delayFinished, setDelayFinished] = useState(false);
  useQuery<WidgetConfig>({
    queryKey: ['configs/widget', 'prod'],
    onSuccess: (data: any) => {
      const res = data.response;
      if (!hasRendered.current) {
        reset({
          ...res,
          isWidgetActive: res.isWidgetActive === 'true',
          widgetAnimation:
            res.widgetAnimation.length === 0
              ? 'shockwave'
              : res.widgetAnimation,
        });
        hasRendered.current = true;
      }
    },
  });

  const isWidgetActive = useWatch({
    control,
    name: 'isWidgetActive',
  });
  const widgetProactiveSeconds = useWatch({
    control,
    name: 'widgetProactiveSeconds',
  });
  const widgetBubbleMessageText = useWatch({
    control,
    name: 'widgetBubbleMessageText',
  });
  const widgetDisplayBubbleMessageSeconds = useWatch({
    control,
    name: 'widgetDisplayBubbleMessageSeconds',
  });
  const widgetColor = useWatch({ control, name: 'widgetColor' });
  const widgetAnimation = useWatch({ control, name: 'widgetAnimation' });

  const widgetConfigMutation = useMutation({
    mutationFn: (data: WidgetConfig) =>
      apiDev.post<WidgetConfig>('configs/widget', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.updateSuccess'),
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const colorComponentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      handleClickOutside(event);
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      colorComponentRef.current &&
      !colorComponentRef.current.contains(event.target as Node)
    ) {
      setShowColorPalette(false);
    }
  };

  const handleFormSubmit = handleSubmit((data) => {
    widgetConfigMutation.mutate(data);
  });

  const handlePreview = () => {
    setShowPreview((prevState) => {
      if (prevState) {
        setDelayFinished(false);
        return false;
      }

      setTimeout(() => {
        setDelayFinished(true);
      }, widgetDisplayBubbleMessageSeconds * 1000);

      return true;
    });
  };

  if (hasRendered.current === undefined) return <>Loading...</>;

  return (
    <div ref={colorComponentRef}>
      <h1 style={{ paddingBottom: 16 }}>{t('settings.appearance.title')}</h1>

      <Card
        footer={
          <Track gap={8} justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
            <Button appearance="secondary" onClick={handlePreview}>
              {t('global.preview')}
            </Button>
          </Track>
        }
      >
        <Track gap={8} direction="vertical" align="left">
          <FormInput
            {...register('widgetProactiveSeconds')}
            label={t('settings.appearance.widgetProactiveSeconds')}
            type="number"
          />
          <Controller
            name="isWidgetActive"
            control={control}
            render={({ field }) => (
              <Switch
                onCheckedChange={field.onChange}
                label={t('settings.appearance.widgetBubbleMessageText')}
                checked={field.value}
                {...field}
              />
            )}
          />
          <FormInput
            {...register('widgetDisplayBubbleMessageSeconds')}
            label={t('settings.appearance.widgetDisplayBubbleMessageSeconds')}
            type="number"
          />
          <FormInput
            {...register('widgetBubbleMessageText')}
            label={t('settings.appearance.widgetBubbleMessageText')}
          />
          <FormInput
            {...register('widgetColor')}
            readOnly={true}
            label={t('settings.appearance.widgetColor')}
            onClick={() => setShowColorPalette(!showColorPalette)}
          >
            {
              <div style={{ flexDirection: 'row' }}>
                <button
                  style={{
                    position: 'absolute',
                    zIndex: '2',
                    right: '10px',
                    bottom: '95%',
                  }}
                  onClick={() => setShowColorPalette(!showColorPalette)}
                >
                  <Icon
                    icon={
                      <MdOutlinePalette
                        fontSize={20}
                        color="rgba(0,0,0,0.54)"
                      />
                    }
                  />
                </button>
                {showColorPalette && (
                  <div style={{ position: 'absolute', zIndex: '2' }}>
                    <ChromePicker
                      {...register('widgetColor')}
                      color={widgetColor}
                      onChange={(color) => setValue('widgetColor', color.hex)}
                    />
                  </div>
                )}
              </div>
            }
          </FormInput>
          <Controller
            name="widgetAnimation"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                onSelectionChange={(selection) =>
                  field.onChange(selection?.value)
                }
                label={t('settings.appearance.widgetAnimation')}
                defaultValue={field.value}
                options={[
                  { label: 'Shockwave', value: 'shockwave' },
                  { label: 'Jump', value: 'jump' },
                  { label: 'Wiggle', value: 'wiggle' },
                ]}
              />
            )}
          />
        </Track>
      </Card>

      {showPreview && (
        <div className="profile__wrapper">
          <motion.div
            className={clsx(
              'profile',
              delayFinished && {
                'profile--shockwave': widgetAnimation === 'shockwave',
                'profile--jump': widgetAnimation === 'jump',
                'profile--wiggle': widgetAnimation === 'wiggle',
              }
            )}
            variants={variants}
            initial="initial"
            animate="animate"
            style={{
              animationIterationCount: widgetProactiveSeconds,
              backgroundColor: widgetColor,
            }}
          >
            <img src={bykLogo} alt="Buerokratt logo" width={45} />
          </motion.div>
          {isWidgetActive && (
            <div
              className={clsx('profile__greeting-message', {
                'profile__greeting-message--active': delayFinished,
              })}
            >
              {widgetBubbleMessageText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default withAuthorization(SettingsAppearance, [ROLES.ROLE_ADMINISTRATOR]);
