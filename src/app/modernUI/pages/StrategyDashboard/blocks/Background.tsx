import { useMode } from 'app/common/state';
import { Spinner } from 'app/modernUI/components';
import { Box, Text } from 'grommet';

interface IBackground {
    heading: any;
    isLoading?: boolean;
    children?: React.ReactNode;
    noHeading?: boolean;
}

export const Background = ({
    heading,
    isLoading = false,
    children = null,
    noHeading = false,
}: IBackground) => {
    const { isLightMode } = useMode();
    return (
        <Box justify="center" align="center" >
            <Box
                round={'16px'}
                overflow="auto"
                width="large"
                align="start"
                justify="between"
                gap="small"
                direction="column"
                background="modal"
                pad={
                    { vertical: 'medium', horizontal: 'medium' }
                }
                style={isLightMode ? { border: '1px solid #EBEBEB' } : {}}
            >
                <Box fill flex="grow" height="100vh">
                    <Box
                        direction="row"
                        justify={!noHeading ? 'between' : 'end'}
                        align="center"
                        fill="horizontal"
                        gap="small"
                    >
                        {!noHeading && (
                            <Box
                                direction="row"
                                fill="horizontal"
                                justify="between"
                                align="center"
                            >
                                <Text size="24px" weight={600}>{heading}</Text>

                            </Box>
                        )}

                    </Box>
                    <Box direction="column" fill="vertical" gap="small">

                        <Box
                            direction="column"
                            fill="vertical"
                            margin={{ vertical: 'medium' }}
                            gap="small"
                        >
                            {isLoading ? (
                                <Box
                                    align="center"
                                    justify="center"
                                    fill="vertical"
                                    margin={{ top: 'large', bottom: 'medium' }}
                                >
                                    <Spinner pad="large" />
                                </Box>
                            ) : (
                                <>{children}</>
                            )}
                        </Box>

                    </Box>
                </Box>
            </Box>
        </Box>
    );
};