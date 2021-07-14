import { ContentSenderInterface } from '@interactiveplus/pdk2021-backendcore/dist/AbstractFactoryTypes/Communication/CommunicationSender/Content/ContentSenderInterface';
import dm, { SingleSendMailRequest, SingleSendMailResponse } from '@alicloud/dm20151123';
import {Config} from '@alicloud/openapi-client';
import { CommunicationContent } from '@interactiveplus/pdk2021-backendcore/dist/AbstractFactoryTypes/Communication/CommunicationSender/Content/CommunicationContent';
import { PDKSenderServiceError } from '@interactiveplus/pdk2021-common/dist/AbstractDataTypes/Error/PDKException';
import { EmailRegexFormat } from '@interactiveplus/pdk2021-common/dist/Utilities/FormatUtil';

const AliCloudDMEndPoints = {
    EastCN1: 'dm.aliyuncs.com',
    SouthEastAsia1_Singapore: 'dm.ap-southeast-1.aliyuncs.com',
    SouthEastAsia2_Sydney: 'dm.ap-southeast-2.aliyuncs.com'
}

type AliCloudDMEndPoint = 'EastCN1' | 'SouthEastAsia1_Singapore' | 'SouthEastAsia2_Sydney';

export {AliCloudDMEndPoints};
export type {AliCloudDMEndPoint};

class AliCloudDMEmailSender implements ContentSenderInterface<string>{
    dmObj : dm;
    accountNameAddr : string;
    fromAlias?: string;

    constructor(
        accessKeyID: string, 
        accessKeySecret : string,
        Endpoint : AliCloudDMEndPoint,
        accountNameAddr: string,
        fromAlias: string
    ){
        this.dmObj = new dm(new Config({
            accessKeyId: accessKeyID,
            accessKeySecret: accessKeySecret,
            endpoint: AliCloudDMEndPoints[Endpoint],
        }));
        this.accountNameAddr = accountNameAddr;
        this.fromAlias = fromAlias;
    }

    canSendTo(address : string){
        return new RegExp(EmailRegexFormat,'g').test(address);
    }

    async sendContent(address : string, content: CommunicationContent) : Promise<void>{
        return this.dmObj.singleSendMail(new SingleSendMailRequest({
            accountName:this.accountNameAddr,
            addressType: 1,
            replyToAddress: false,
            toAddress: address,
            clickTrace: '1',
            fromAlias: this.fromAlias,
            htmlBody: content.content,
            subject: content.title === undefined ? '(No Subject)' : content.title
        })).catch((reason)=>{
            throw new PDKSenderServiceError('Failed to send email: ' + JSON.stringify(reason));
        }).then((response : SingleSendMailResponse) => {
            return;
        });
    }
}

export default AliCloudDMEmailSender;