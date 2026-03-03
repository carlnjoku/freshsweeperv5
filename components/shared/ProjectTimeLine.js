import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const ProjectTimelineBar = ({ currentStatus }) => {
  const stages = [
    { 
      key: 'published', 
      label: 'Published', 
      icon: 'upload',
      completedIcon: 'upload',
      activeIcon: 'upload'
    },
    { 
      key: 'accepted', 
      label: 'Accepted', 
      icon: 'account-check',
      completedIcon: 'account-check',
      activeIcon: 'account-check'
    },
    { 
      key: 'completed', 
      label: 'Completed', 
      icon: 'flag-checkered',
      completedIcon: 'flag-checkered',
      activeIcon: 'flag-checkered'
    }
  ];

  const getStageIndex = (status) => {
    return stages.findIndex(stage => stage.key === status);
  };

  const currentStageIndex = getStageIndex(currentStatus);

  const getStageStatus = (index) => {
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'active';
    return 'upcoming';
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'active': return COLORS.primary;
      case 'upcoming': return COLORS.light_gray;
      default: return COLORS.light_gray;
    }
  };

  const getIconColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.white;
      case 'active': return COLORS.white;
      case 'upcoming': return COLORS.gray;
      default: return COLORS.gray;
    }
  };

  const getLineColor = (index) => {
    return index < currentStageIndex ? COLORS.success : COLORS.light_gray;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        {stages.map((stage, index) => {
          const status = getStageStatus(index);
          const isCompleted = status === 'completed';
          const isActive = status === 'active';
          const isUpcoming = status === 'upcoming';

          return (
            <React.Fragment key={stage.key}>
              {/* Stage Item */}
              <View style={styles.stageItem}>
                {/* Stage Icon */}
                <View 
                  style={[
                    styles.stageIcon,
                    {
                      backgroundColor: getStageColor(status),
                      borderColor: isActive ? COLORS.primary : 'transparent'
                    }
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={isCompleted ? stage.completedIcon : stage.activeIcon} 
                    size={20} 
                    color={getIconColor(status)} 
                  />
                </View>

                {/* Stage Label */}
                <Text 
                  style={[
                    styles.stageLabel,
                    {
                      color: isCompleted || isActive ? COLORS.dark : COLORS.gray,
                      fontWeight: isActive ? '600' : '400'
                    }
                  ]}
                >
                  {stage.label}
                </Text>
              </View>

              {/* Progress Line (except for last stage) */}
              {index < stages.length - 1 && (
                <View 
                  style={[
                    styles.progressLine,
                    { backgroundColor: getLineColor(index) }
                  ]} 
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Current Status Indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Current Status: 
          <Text style={[styles.statusHighlight, { color: getStageColor('active') }]}>
            {' '}{stages[currentStageIndex]?.label}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
  },
  stageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  progressLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 3,
    marginTop:-20,
    borderRadius: 2,
    backgroundColor: COLORS.light_gray,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statusHighlight: {
    fontWeight: '600',
  },
});

export default ProjectTimelineBar;