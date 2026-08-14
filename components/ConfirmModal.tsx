import React from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { X, Check } from 'lucide-react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({ 
  visible, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-slate-900/40 p-4" style={Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } as any : {}}>
        <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onCancel} />
        
        <View className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl elevation-10 p-6">
          <View className="items-center mb-6">
            <View className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${isDestructive ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {isDestructive ? (
                <X size={28} color="#ef4444" />
              ) : (
                <Check size={28} color="#10b981" />
              )}
            </View>
            <Text className="text-slate-900 text-xl font-black tracking-tight text-center mb-2">{title}</Text>
            <Text className="text-slate-500 text-center font-medium leading-relaxed">{message}</Text>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={onCancel}
              className="flex-1 bg-slate-100 py-3.5 rounded-xl items-center justify-center active:bg-slate-200"
            >
              <Text className="text-slate-700 font-bold tracking-wide">{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center ${isDestructive ? 'bg-red-600 active:bg-red-700' : 'bg-emerald-600 active:bg-emerald-700'}`}
            >
              <Text className="text-white font-bold tracking-wide">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
