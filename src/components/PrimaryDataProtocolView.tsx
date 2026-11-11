import React from 'react';
import { CalibrationItemInfo, ChamberPointData, ChamberCalculation } from '../types';
import { ProtocolExcelEditor } from './ProtocolExcelEditor';

interface PrimaryDataProtocolViewProps {
  info: CalibrationItemInfo;
  pointsData: ChamberPointData[];
  calculation: ChamberCalculation;
  onBackToEdit: () => void;
  onOpenCertificate?: () => void;
  onSaveCertificate?: () => void;
}

export const PrimaryDataProtocolView: React.FC<PrimaryDataProtocolViewProps> = ({
  info,
  pointsData,
  calculation,
  onBackToEdit,
  onSaveCertificate,
}) => {
  return (
    <div className="space-y-4">
      <ProtocolExcelEditor
        info={info}
        pointsData={pointsData}
        calculation={calculation}
        onBackToEdit={onBackToEdit}
        onSaveCertificate={onSaveCertificate}
      />
    </div>
  );
};
