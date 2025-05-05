import { TypeUploadFile } from './type-upload-file.enum';
import { IUser } from './user.interface';

export interface IUploadFile {
  id: number;
  createdDate: string;
  idUserCreate: IUser;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  type: TypeUploadFile;
}
