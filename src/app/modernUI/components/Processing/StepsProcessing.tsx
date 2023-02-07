import { useMode } from 'app/common/state';
import { TPossibleStep } from 'app/common/types/global';
import floatingCoinsAnimation from 'app/modernUI/animations/floatingCoins.svg';
import check from 'app/modernUI/images/check.svg';
import cross from 'app/modernUI/images/cross.svg';
import floatingErrorCoinsDark from 'app/modernUI/images/floatingErrorCoins-dark.svg';
import floatingErrorCoins from 'app/modernUI/images/floatingErrorCoins.svg';
import { Box, Button, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

type TStepsProcessing = {
  title: string;
  steps: TPossibleStep[];
  currentStep: any;
  isHandlingStep: boolean;
  stepWasSuccessful: boolean;
  stepError: string;
  stopProcessingSteps: Function;
  handleCurrentStep: Function;
  minHeight: string;
  allFinishedLabel?: string;
  allFinishedLink?:string;
};

export const StepsProcessing = ({
  title,
  steps,
  currentStep,
  isHandlingStep,
  stepWasSuccessful,
  stepError,
  stopProcessingSteps,
  handleCurrentStep,
  minHeight,
  allFinishedLabel,
  allFinishedLink
}: TStepsProcessing) => {
  // react
  const navigate = useNavigate();

  // theme
  const { isLightMode } = useMode();

  const circleColor = isLightMode ? 'white' : 'black';
  const selectedCircleColor = isLightMode ? 'black' : 'white';
  const checkedCircleColor = isLightMode ? '#C9CFEA' : '#C9CFEA';
  const errorColor = '#FF0000';

  const step = steps[currentStep.current];
  const isLastStep = currentStep.current == steps.length - 1;
  const stepWasProcessedSuccessfully =
    !isHandlingStep && stepWasSuccessful == true;
  const stepFailed = !isHandlingStep && stepWasSuccessful == false;
  const allStepsFinishedSuccessfully =
    isLastStep && stepWasProcessedSuccessfully;

  // defaults
  let finalImage = floatingCoinsAnimation;

  // not processing and step failed
  if (stepFailed) {
    finalImage = isLightMode ? floatingErrorCoins : floatingErrorCoinsDark;
  }

  // not processing and step was succesful
  if (stepWasProcessedSuccessfully) {
    finalImage = step.successImage ? step.successImage : finalImage;
  }

  // while processing
  if (isHandlingStep) {
    finalImage = step.image ? step.image : finalImage;
  }

  return (
    <Box
      justify="between"
      pad={{ bottom: '40px' }}
      fill
      style={{ minHeight: minHeight, maxHeight: minHeight }}
    >
      <Box gap="24px">
        <Box fill="horizontal" align="center">
          <Text size="24px" weight={600}>
            {allStepsFinishedSuccessfully ? 'Success!' : title}
          </Text>
        </Box>
        <Box>
          {steps.map((step, index) => {
            return (
              <Box key={index} direction="row" gap="30px" align="center">
                <Box
                  round="50%"
                  background={
                    // Succefully processed steps
                    // All steps worked (all checked)
                    allStepsFinishedSuccessfully ||
                    // Current step worked (required click to get to next)
                    (currentStep.current == index &&
                      stepWasProcessedSuccessfully) ||
                    // Steps before the current had to be successfull
                    currentStep.current > index
                      ? checkedCircleColor
                      : // Current Step
                      currentStep.current == index
                      ? // Current step failed
                        stepFailed
                        ? errorColor
                        : selectedCircleColor
                      : // Steps to come
                        circleColor
                  }
                  style={{
                    ...{ minWidth: '48px', minHeight: '48px' },
                    ...(currentStep.current == index && stepFailed
                      ? // Step failed (red border)
                        { border: '4px solid #FFE5E5' }
                      : currentStep.current >= index
                      ? // Current and previous (big border)
                        { border: '4px solid #EBEBEB' }
                      : // Steps to come have small border
                        { border: '1px solid #C9CFEA' }),
                  }}
                  justify="center"
                  align="center"
                >
                  {
                    // Succefully processed steps
                    // All steps worked (all checked)
                    allStepsFinishedSuccessfully ||
                    // Current step worked (required click to get to next)
                    (currentStep.current == index &&
                      stepWasProcessedSuccessfully) ||
                    // Steps before the current had to be successfull
                    currentStep.current > index ? (
                      <img src={check} />
                    ) : // Current Step
                    currentStep.current == index ? (
                      // Current step failed
                      stepFailed ? (
                        <img src={cross} />
                      ) : (
                        index + 1
                      )
                    ) : (
                      // Steps to come
                      index + 1
                    )
                  }
                </Box>
                <Box pad={{ vertical: '2px' }} fill="vertical">
                  <Text size="18px" weight={500} margin={{ top: '21px' }}>
                    {!isHandlingStep && currentStep.current == index
                      ? stepWasSuccessful == true
                        ? step.successLabel
                        : step.errorLabel
                      : step.label}
                  </Text>
                  <Box style={{ minHeight: '21px' }}>
                    {isHandlingStep && currentStep.current == index && (
                      <Text size="14px" weight={400} color="#2A73FF">
                        Action needed in wallet
                      </Text>
                    )}
                    {!isHandlingStep &&
                      currentStep.current == index &&
                      stepWasSuccessful == false &&
                      stepError != '' && (
                        <Text size="14px" weight={400} color={errorColor}>
                          {stepError}
                        </Text>
                      )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box gap="24px" align="center">
        {stepWasSuccessful != undefined ? (
          <Box className="fade-in" fill>
            <img src={finalImage} />
          </Box>
        ) : (
          <img src={finalImage} />
        )}
      </Box>
      <Box height="81px" justify="end" align='center'>
        {isHandlingStep && (
          <Text size="14px" weight={400}>
            Waiting for confirmation in wallet...
          </Text>
        )}
        {!isHandlingStep && stepWasSuccessful == true && (
          <Box gap="20px" align="center">
            <Text size="14px" weight={400} textAlign="center">
              {step.successMessage ? step.successMessage : step.successLabel}
            </Text>
            <Button
              primary
              label={
                allStepsFinishedSuccessfully
                  ? allFinishedLabel ? allFinishedLabel : 'View your farms'
                  : 'Continue to ' + steps[currentStep.current + 1].label.toLowerCase()
              }
              style={{
                borderRadius: '58px',
                minWidth: '197px',
                height: '40px',
                padding: '8px 24px 8px 24px',
              }}
              onClick={() => {
                if (allStepsFinishedSuccessfully) {
                  navigate(allFinishedLink ? allFinishedLink : '/?view_type=my_farms');
                } else {
                  currentStep.current = currentStep.current + 1;
                  stepWasSuccessful = undefined;
                  handleCurrentStep();
                }
              }}
            />
          </Box>
        )}
        {!isHandlingStep && stepWasSuccessful == false && (
          <Box gap="20px" align="center">
            <Text size="14px" weight={400}>
              Transaction failed
            </Text>
            <Box direction="row" gap="16px">
              <Button
                label="close"
                style={{
                  borderRadius: '58px',
                  minWidth: '113px',
                  height: '40px',
                  padding: '6px 24px 6px 24px',
                }}
                onClick={() => stopProcessingSteps()}
              />
              <Button
                primary
                label="try again"
                style={{
                  borderRadius: '58px',
                  minWidth: '113px',
                  height: '40px',
                  padding: '8px 24px 8px 24px',
                }}
                onClick={() => handleCurrentStep()}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
