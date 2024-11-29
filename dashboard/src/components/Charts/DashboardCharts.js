import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Box, Paper, Typography, useTheme } from '@mui/material';

// Composant pour le graphique en ligne
export const LineChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Période',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Nombre',
          legendOffset: -40,
          legendPosition: 'middle'
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: theme.palette.text.primary
              }
            },
            legend: {
              text: {
                fill: theme.palette.text.primary
              }
            }
          },
          grid: {
            line: {
              stroke: theme.palette.divider
            }
          },
          legends: {
            text: {
              fill: theme.palette.text.primary
            }
          }
        }}
      />
    </Box>
  );
};

// Composant pour le graphique en barres
export const BarChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={['volés', 'perdus', 'retrouvés']}
        indexBy="zone"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Zone',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Nombre',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: theme.palette.text.primary
              }
            },
            legend: {
              text: {
                fill: theme.palette.text.primary
              }
            }
          },
          legends: {
            text: {
              fill: theme.palette.text.primary
            }
          }
        }}
      />
    </Box>
  );
};

// Composant pour la carte thermique
export const HeatMap = ({ data }) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        valueFormat=">-.2s"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: '',
          legendOffset: 46
        }}
        axisRight={null}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Zone',
          legendPosition: 'middle',
          legendOffset: -72
        }}
        colors={{
          type: 'sequential',
          scheme: 'blues'
        }}
        emptyColor="#555555"
        legends={[
          {
            anchor: 'bottom',
            translateX: 0,
            translateY: 30,
            length: 400,
            thickness: 8,
            direction: 'row',
            tickPosition: 'after',
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            tickFormat: '>-.2s',
            title: 'Nombre de signalements →',
            titleAlign: 'start',
            titleOffset: 4
          }
        ]}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: theme.palette.text.primary
              }
            },
            legend: {
              text: {
                fill: theme.palette.text.primary
              }
            }
          },
          legends: {
            text: {
              fill: theme.palette.text.primary
            }
          }
        }}
      />
    </Box>
  );
};

// Composant conteneur pour les graphiques
const DashboardCharts = ({ lineData, barData, heatmapData }) => {
  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Évolution des Signalements
        </Typography>
        <LineChart data={lineData} />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Répartition par Zone
        </Typography>
        <BarChart data={barData} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Carte Thermique des Signalements
        </Typography>
        <HeatMap data={heatmapData} />
      </Paper>
    </>
  );
};

export default DashboardCharts;
