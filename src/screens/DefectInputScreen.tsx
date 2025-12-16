// Defect Input Screen - Enhanced to match Web app functionality

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  SegmentedButtons,
  Snackbar,
  Menu,
  Divider,
  IconButton,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { colors, severityColors } from '../theme';
import { ImageUpload } from '../types';

// Form data interface matching Web app
interface FormData {
  occurrence_date: Date;
  part_name: string;
  part_number: string;
  process_name: string;
  machine_name: string;
  discoverer_name: string;
  phenomenon: string;
  defect_type: string;
  severity: 'critical' | 'major' | 'minor';
  category_4m: 'Man' | 'Machine' | 'Material' | 'Method' | '';
  factor: string;
  root_cause: string;
  countermeasure: string;
  notes: string;
  defect_image: ImageUpload | null;
  good_image: ImageUpload | null;
  workflow_image: ImageUpload | null;
}

// Options matching Web app
const DEFECT_TYPES = [
  '寸法不良',
  '外観不良',
  '機能不良',
  '組付け不良',
  '材料不良',
  '加工不良',
  'その他',
];

const CATEGORY_4M = [
  { value: 'Man', label: '人 (Man)' },
  { value: 'Machine', label: '機械 (Machine)' },
  { value: 'Material', label: '材料 (Material)' },
  { value: 'Method', label: '方法 (Method)' },
];

const SEVERITY_OPTIONS = [
  { value: 'minor', label: '軽微', color: severityColors.low },
  { value: 'major', label: '重大', color: severityColors.medium },
  { value: 'critical', label: '致命的', color: severityColors.critical },
];

const initialFormData: FormData = {
  occurrence_date: new Date(),
  part_name: '',
  part_number: '',
  process_name: '',
  machine_name: '',
  discoverer_name: '',
  phenomenon: '',
  defect_type: '',
  severity: 'minor',
  category_4m: '',
  factor: '',
  root_cause: '',
  countermeasure: '',
  notes: '',
  defect_image: null,
  good_image: null,
  workflow_image: null,
};

export default function DefectInputScreen() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDefectTypeMenu, setShowDefectTypeMenu] = useState(false);
  const [show4MMenu, setShow4MMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);

  const sections = ['基本情報', '不良詳細', '4M分析', '対策・画像'];

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.part_name.trim()) {
      newErrors.part_name = '品名を入力してください';
    }
    if (!formData.phenomenon.trim()) {
      newErrors.phenomenon = '現象を入力してください';
    }
    if (!formData.defect_type) {
      newErrors.defect_type = '不良種別を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (field: 'defect_image' | 'good_image' | 'workflow_image') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', '画像ライブラリへのアクセス許可が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData(field, {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        filename: result.assets[0].fileName || `image_${Date.now()}.jpg`,
      });
    }
  };

  const takePhoto = async (field: 'defect_image' | 'good_image' | 'workflow_image') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', 'カメラへのアクセス許可が必要です');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData(field, {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        filename: `photo_${Date.now()}.jpg`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ visible: true, message: '必須項目を入力してください', type: 'error' });
      return;
    }

    Alert.alert(
      '確認',
      '不適合報告を送信しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '送信',
          onPress: async () => {
            setIsLoading(true);
            try {
              const submitData = {
                occurrence_date: formData.occurrence_date.toISOString().split('T')[0],
                part_name: formData.part_name.trim(),
                part_number: formData.part_number.trim(),
                process_name: formData.process_name.trim(),
                machine_name: formData.machine_name.trim(),
                discoverer_name: formData.discoverer_name.trim(),
                phenomenon: formData.phenomenon.trim(),
                defect_type: formData.defect_type,
                severity: formData.severity,
                category_4m: formData.category_4m,
                factor: formData.factor.trim(),
                root_cause: formData.root_cause.trim(),
                countermeasure: formData.countermeasure.trim(),
                notes: formData.notes.trim(),
                defect_image: formData.defect_image,
                good_image: formData.good_image,
                workflow_image: formData.workflow_image,
              };

              await api.createDefectReport(submitData as any);
              setSnackbar({ visible: true, message: '不適合報告を送信しました', type: 'success' });
              setFormData(initialFormData);
              setCurrentSection(0);
              setErrors({});
            } catch (err: any) {
              console.error('Failed to submit:', err);
              setSnackbar({
                visible: true,
                message: err?.response?.data?.detail || '送信に失敗しました',
                type: 'error',
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const renderImagePicker = (
    field: 'defect_image' | 'good_image' | 'workflow_image',
    label: string,
    icon: string
  ) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.imageLabel}>{label}</Text>
      {formData[field] ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: formData[field]!.uri }} style={styles.imagePreview} />
          <IconButton
            icon="close-circle"
            size={24}
            style={styles.removeImageButton}
            iconColor={colors.error}
            onPress={() => updateFormData(field, null)}
          />
        </View>
      ) : (
        <View style={styles.imageButtons}>
          <Button
            mode="outlined"
            icon="camera"
            onPress={() => takePhoto(field)}
            style={styles.imageButton}
            compact
          >
            撮影
          </Button>
          <Button
            mode="outlined"
            icon="image"
            onPress={() => pickImage(field)}
            style={styles.imageButton}
            compact
          >
            選択
          </Button>
        </View>
      )}
    </View>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0: // 基本情報
        return (
          <>
            {/* Date Picker */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>発生日 *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                <Text style={styles.dateText}>{formatDate(formData.occurrence_date)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.occurrence_date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) updateFormData('occurrence_date', date);
                  }}
                  locale="ja-JP"
                />
              )}
            </Surface>

            {/* Part Info */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>部品情報</Text>
              <TextInput
                label="品名 *"
                value={formData.part_name}
                onChangeText={(text) => updateFormData('part_name', text)}
                mode="outlined"
                style={styles.textInput}
                error={!!errors.part_name}
                left={<TextInput.Icon icon="cube" />}
              />
              {errors.part_name && <Text style={styles.errorText}>{errors.part_name}</Text>}

              <TextInput
                label="品番"
                value={formData.part_number}
                onChangeText={(text) => updateFormData('part_number', text)}
                mode="outlined"
                style={styles.textInput}
                left={<TextInput.Icon icon="barcode" />}
              />

              <TextInput
                label="工程名"
                value={formData.process_name}
                onChangeText={(text) => updateFormData('process_name', text)}
                mode="outlined"
                style={styles.textInput}
                left={<TextInput.Icon icon="cog-outline" />}
              />

              <TextInput
                label="設備名"
                value={formData.machine_name}
                onChangeText={(text) => updateFormData('machine_name', text)}
                mode="outlined"
                style={styles.textInput}
                left={<TextInput.Icon icon="robot-industrial" />}
              />

              <TextInput
                label="発見者"
                value={formData.discoverer_name}
                onChangeText={(text) => updateFormData('discoverer_name', text)}
                mode="outlined"
                style={styles.textInput}
                left={<TextInput.Icon icon="account" />}
              />
            </Surface>
          </>
        );

      case 1: // 不良詳細
        return (
          <>
            {/* Phenomenon */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>現象 *</Text>
              <TextInput
                value={formData.phenomenon}
                onChangeText={(text) => updateFormData('phenomenon', text)}
                placeholder="不良の現象を詳しく記述してください"
                multiline
                numberOfLines={4}
                mode="outlined"
                style={[styles.textInput, styles.multilineInput]}
                error={!!errors.phenomenon}
              />
              {errors.phenomenon && <Text style={styles.errorText}>{errors.phenomenon}</Text>}
            </Surface>

            {/* Defect Type */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>不良種別 *</Text>
              <Menu
                visible={showDefectTypeMenu}
                onDismiss={() => setShowDefectTypeMenu(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setShowDefectTypeMenu(true)}
                    style={[styles.menuButton, errors.defect_type && styles.errorBorder]}
                    contentStyle={styles.menuButtonContent}
                    icon="chevron-down"
                  >
                    {formData.defect_type || '不良種別を選択'}
                  </Button>
                }
                contentStyle={styles.menuContent}
              >
                {DEFECT_TYPES.map((type) => (
                  <Menu.Item
                    key={type}
                    onPress={() => {
                      updateFormData('defect_type', type);
                      setShowDefectTypeMenu(false);
                    }}
                    title={type}
                  />
                ))}
              </Menu>
              {errors.defect_type && <Text style={styles.errorText}>{errors.defect_type}</Text>}
            </Surface>

            {/* Severity */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>重大度 *</Text>
              <View style={styles.severityContainer}>
                {SEVERITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.severityOption,
                      formData.severity === option.value && {
                        backgroundColor: option.color,
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => updateFormData('severity', option.value as FormData['severity'])}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        formData.severity === option.value && styles.severityTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Surface>
          </>
        );

      case 2: // 4M分析
        return (
          <>
            {/* 4M Category */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>4M分類</Text>
              <View style={styles.category4mContainer}>
                {CATEGORY_4M.map((cat) => (
                  <Chip
                    key={cat.value}
                    selected={formData.category_4m === cat.value}
                    onPress={() => updateFormData('category_4m', cat.value as FormData['category_4m'])}
                    style={styles.category4mChip}
                    selectedColor={colors.primary}
                  >
                    {cat.label}
                  </Chip>
                ))}
              </View>
            </Surface>

            {/* Factor */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>要因</Text>
              <TextInput
                value={formData.factor}
                onChangeText={(text) => updateFormData('factor', text)}
                placeholder="不良の要因を記述"
                multiline
                numberOfLines={3}
                mode="outlined"
                style={[styles.textInput, styles.multilineInput]}
              />
            </Surface>

            {/* Root Cause */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>真因</Text>
              <TextInput
                value={formData.root_cause}
                onChangeText={(text) => updateFormData('root_cause', text)}
                placeholder="根本原因を記述（なぜなぜ分析結果など）"
                multiline
                numberOfLines={4}
                mode="outlined"
                style={[styles.textInput, styles.multilineInput]}
              />
            </Surface>
          </>
        );

      case 3: // 対策・画像
        return (
          <>
            {/* Countermeasure */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>対策</Text>
              <TextInput
                value={formData.countermeasure}
                onChangeText={(text) => updateFormData('countermeasure', text)}
                placeholder="実施した/する予定の対策を記述"
                multiline
                numberOfLines={4}
                mode="outlined"
                style={[styles.textInput, styles.multilineInput]}
              />
            </Surface>

            {/* Notes */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>備考</Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => updateFormData('notes', text)}
                placeholder="その他の情報"
                multiline
                numberOfLines={3}
                mode="outlined"
                style={[styles.textInput, styles.multilineInput]}
              />
            </Surface>

            {/* Images */}
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>画像添付</Text>
              {renderImagePicker('defect_image', '不良品画像', 'image-broken')}
              <Divider style={styles.divider} />
              {renderImagePicker('good_image', '良品画像', 'image-check')}
              <Divider style={styles.divider} />
              {renderImagePicker('workflow_image', '作業フロー画像', 'clipboard-flow')}
            </Surface>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Section Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sections.map((section, index) => (
            <TouchableOpacity
              key={section}
              style={[
                styles.tab,
                currentSection === index && styles.tabActive,
              ]}
              onPress={() => setCurrentSection(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  currentSection === index && styles.tabTextActive,
                ]}
              >
                {index + 1}. {section}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ProgressBar
          progress={(currentSection + 1) / sections.length}
          color={colors.primary}
          style={styles.progressBar}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderSection()}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentSection > 0 && (
            <Button
              mode="outlined"
              onPress={() => setCurrentSection(currentSection - 1)}
              style={styles.navButton}
              icon="arrow-left"
            >
              戻る
            </Button>
          )}
          {currentSection < sections.length - 1 ? (
            <Button
              mode="contained"
              onPress={() => setCurrentSection(currentSection + 1)}
              style={[styles.navButton, styles.nextButton]}
              icon="arrow-right"
              contentStyle={styles.nextButtonContent}
            >
              次へ
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={[styles.navButton, styles.submitButton]}
              icon="send"
            >
              送信
            </Button>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{ backgroundColor: snackbar.type === 'success' ? colors.success : colors.error }}
      >
        {snackbar.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: `${colors.primary}15`,
  },
  tabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 3,
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.grey300,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  menuButton: {
    borderRadius: 8,
  },
  menuButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  menuContent: {
    backgroundColor: '#fff',
  },
  errorBorder: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 8,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.grey300,
    alignItems: 'center',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  severityTextActive: {
    color: '#fff',
  },
  category4mContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  category4mChip: {
    marginBottom: 4,
  },
  imagePickerContainer: {
    marginBottom: 12,
  },
  imageLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 150,
    height: 112,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
  },
  divider: {
    marginVertical: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  nextButtonContent: {
    flexDirection: 'row-reverse',
  },
  submitButton: {
    backgroundColor: colors.success,
  },
});
