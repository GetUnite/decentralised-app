import { EChain } from 'app/common/constants/chains';
import { useMode } from 'app/common/state';
import { useStreamCard } from 'app/common/state/autoInvest/useStreamCard';
import {
  DateInput,
  Modal,
  StepsProcessing,
  StreamInput,
  TokenIcon,
} from 'app/modernUI/components';
import pencilDark from 'app/modernUI/images/pencil-dark.svg';
import pencil from 'app/modernUI/images/pencil.svg';
import saveStreamDark from 'app/modernUI/images/saveStream-dark.svg';
import saveStream from 'app/modernUI/images/saveStream.svg';
import stopStreamDark from 'app/modernUI/images/stopStream-dark.svg';
import stopStream from 'app/modernUI/images/stopStream.svg';
import { Box, Button, Grid, Layer, ResponsiveContext, Text } from 'grommet';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { AddFundsConfirmation } from '../blocks/AddFundsConfirmation';
import { StopStreamConfirmation } from '../blocks/StopStreamConfirmation';
import { isSmall } from 'app/modernUI/theme';

interface IStreamCard {
  from?: string;
  fromAddress?: string;
  fromStAddress?: string;
  to?: string;
  toAddress?: string;
  toStAddress?: string;
  tvs?: string;
  flowPerMonth?: string;
  startDate?: string;
  endDate?: string;
  fundedUntilDate?: string;
  handleStopStream?: Function;
  sign?: string;
  isStoppingStream?: boolean;
  isLoading?: boolean;
  updateAutoInvestInfo?: any;
  sourceDepositedAmount?: string;
  fromIcon?: string;
  toIcon?: string;
}

export const StreamCard = ({
  from,
  sourceDepositedAmount,
  fromAddress,
  fromStAddress,
  to,
  toAddress,
  toStAddress,
  tvs,
  flowPerMonth,
  startDate,
  endDate,
  fundedUntilDate,
  handleStopStream,
  isStoppingStream,
  sign,
  isLoading = false,
  updateAutoInvestInfo,
  fromIcon,
  toIcon,
}: IStreamCard) => {
  const {
    // errors
    hasErrors,
    streamValueError,
    newEndDateError,
    // edit mode
    isEditMode,
    setIsEditMode,
    // inputs
    newEndDate,
    setNewEndDate,
    streamValue,
    validateInputs,
    // confirmations
    stopStreamConfirmation,
    setStopStreamConfirmation,
    addFundsConfirmation,
    setAddFundsConfirmation,
    // steps
    isProcessing,
    currentStep,
    isHandlingStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
  } = useStreamCard({
    from,
    sourceDepositedAmount,
    endDate,
    fromAddress,
    fromStAddress,
    to,
    toAddress,
    toStAddress,
    updateAutoInvestInfo,
  });

  const { isLightMode } = useMode();

  const [isHover, setIsHover] = useState<boolean>(false);

  const hoverColor = isLightMode ? '#F4F8FF' : '#4C4C4C40';
  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          {isSmall(size) ? (
            <Box
              style={{
                position: 'relative',
                borderTop: `0.5px solid ${dividerColor}`,
              }}
              pad="large"
              height="fit"
              background="card"
              fill="horizontal"
            >
              <Box direction="row" justify="between">
                <Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="start">
                    <Text>From</Text>
                    <Text>
                      {isLoading ? (
                        <Skeleton
                          height="12px"
                          width="96px"
                          borderRadius="20px"
                        />
                      ) : (
                        <span style={{ fontWeight: '500', fontSize: '12px' }}>
                          {from} Farm
                        </span>
                      )}
                    </Text>
                  </Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="start">
                    <Text margin="none">To</Text>
                    <Text>
                      {isLoading ? (
                        <Skeleton
                          height="12px"
                          width="96px"
                          borderRadius="20px"
                        />
                      ) : (
                        <span style={{ fontWeight: '500', fontSize: '12px' }}>
                          {to} Farm
                        </span>
                      )}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="start">
                    <Text>TVS</Text>
                    <Text>
                      {isLoading ? (
                        <Skeleton
                          height="14px"
                          width="106px"
                          borderRadius="20px"
                        />
                      ) : (
                        <span style={{ fontSize: '12px' }}>
                          {sign}
                          {tvs}
                        </span>
                      )}
                    </Text>
                  </Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="start">
                    <Text margin="none">flow rate</Text>
                    <Text>
                      {isLoading ? (
                        <Skeleton
                          height="14px"
                          width="106px"
                          borderRadius="20px"
                        />
                      ) : (
                        <span style={{ fontSize: '12px' }}>
                          {sign}
                          {flowPerMonth}/m
                        </span>
                      )}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="start">
                    <Text>end date</Text>
                    <Text>
                      {isLoading ? (
                        <Skeleton
                          height="12px"
                          width="96px"
                          borderRadius="20px"
                        />
                      ) : (
                        <span style={{ fontSize: '12px' }}>
                          {endDate || '∞'}
                        </span>
                      )}
                    </Text>
                  </Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="start">
                    <Text margin="none">funded until</Text>
                    <Text>
                      {isLoading ? (
                        <Skeleton
                          height="12px"
                          width="96px"
                          borderRadius="20px"
                        />
                      ) : (
                        <span style={{ fontSize: '12px' }}>{fundedUntilDate}</span>
                      )}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              pad={{ horizontal: 'medium', vertical: 'none' }}
              height="120px"
              style={{ borderTop: `0.5px solid ${dividerColor}` }}
              background={isHover ? hoverColor : ''}
              align="center"
              justify="center"
              fill="horizontal"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              <Grid
                fill="horizontal"
                rows="xxsmall"
                align="center"
                justify="start"
                columns={[
                  '150px',
                  '150px',
                  '150px',
                  '150px',
                  '130px',
                  '150px',
                  'auto',
                ]}
                pad={{ top: '10px', bottom: '10px' }}
                style={{ fontSize: '16px' }}
              >
                {isLoading ? (
                  <>
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                    <Skeleton height="14px" width="76px" borderRadius="20px" />
                  </>
                ) : (
                  <>
                    <Box direction="row" gap="5px">
                      <TokenIcon label={fromIcon ? fromIcon : from} />{' '}
                      <span style={{ fontWeight: '500' }}>{from} Farm</span>
                    </Box>
                    <Box direction="row" gap="5px">
                      <TokenIcon label={toIcon ? toIcon : to} />{' '}
                      <span style={{ fontWeight: '500' }}>{to} Farm</span>
                    </Box>
                    <Box direction="row" gap="5px">
                      <span>
                        {sign}
                        {tvs}
                      </span>
                    </Box>
                    <Box direction="row" gap="5px">
                      {!isEditMode ? (
                        <span>
                          {sign}
                          {flowPerMonth}/m
                        </span>
                      ) : (
                        <StreamInput
                          tokenSign={sign}
                          value={streamValue}
                          onValueChange={validateInputs}
                          isSmall={true}
                          style={{ width: '80%' }}
                        />
                      )}
                    </Box>
                    <span>{startDate}</span>
                    <Box>
                      {!isEditMode ? (
                        <Text size="16px">{endDate || '∞'}</Text>
                      ) : (
                        <DateInput
                          date={newEndDate}
                          setDate={setNewEndDate}
                          style={{ width: '80%' }}
                        />
                      )}
                    </Box>
                    <Box direction="row" justify="between" align="center" fill>
                      <span>{fundedUntilDate}</span>
                      <Box direction="row">
                        {!isEditMode ? (
                          <>
                            <Button plain onClick={() => setIsEditMode(true)}>
                              <img
                                src={isLightMode ? pencil : pencilDark}
                                height={22}
                                width={22}
                              />
                            </Button>
                            <StopStreamConfirmation
                              stopStreamConfirmation={stopStreamConfirmation}
                              setStopStreamConfirmation={
                                setStopStreamConfirmation
                              }
                              fromAddress={fromAddress}
                              toAddress={toAddress}
                              handleStopStream={handleStopStream}
                              isStoppingStream={isStoppingStream}
                            />
                          </>
                        ) : (
                          <>
                            <Button plain onClick={() => setIsEditMode(false)}>
                              <img
                                src={isLightMode ? stopStream : stopStreamDark}
                              />
                            </Button>
                            <Button
                              plain
                              disabled={hasErrors || streamValue == ''}
                              onClick={() => startProcessingSteps()}
                            >
                              <img
                                src={isLightMode ? saveStream : saveStreamDark}
                              />
                            </Button>
                            {isProcessing && (
                              <Layer>
                                <Modal
                                  chain={EChain.POLYGON}
                                  heading={''}
                                  noHeading={isProcessing}
                                  closeAction={
                                    isProcessing
                                      ? stopProcessingSteps
                                      : undefined
                                  }
                                >
                                  <StepsProcessing
                                    title="Editing stream..."
                                    steps={steps.current}
                                    currentStep={currentStep}
                                    isHandlingStep={isHandlingStep}
                                    stepWasSuccessful={
                                      stepWasSuccessful.current
                                    }
                                    stepError={stepError.current}
                                    stopProcessingSteps={stopProcessingSteps}
                                    handleCurrentStep={handleCurrentStep}
                                    minHeight={'627px'}
                                    allFinishedLabel="Go to autoInvest"
                                    allFinishedLink="/autoinvest"
                                  />
                                </Modal>
                              </Layer>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </Grid>
            </Box>
          )}
          {isEditMode && (
            <Box
              fill="horizontal"
              justify="start"
              direction="row"
              height="24px"
              pad={{ horizontal: 'medium', vertical: 'none' }}
            >
              {hasErrors && (
                <Text color="error">
                  {newEndDateError != '' ? (
                    newEndDateError
                  ) : (
                    <>
                      <span>{streamValueError}. </span>
                      <AddFundsConfirmation
                        addFundsConfirmation={addFundsConfirmation}
                        setAddFundsConfirmation={setAddFundsConfirmation}
                        setIsEditMode={setIsEditMode}
                        fromAddress={fromAddress}
                      />
                    </>
                  )}
                </Text>
              )}
            </Box>
          )}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
