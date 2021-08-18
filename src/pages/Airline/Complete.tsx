import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPage,
  IonRippleEffect,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { chevronDown, chevronUp, timeOutline } from "ionicons/icons";
import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "../../data/connect";
import * as selectors from "../../data/selectors";
import { setTourPaymentAllowStatus } from "../../data/tour/tour.actions";
import "./Order.scss";
import AirlineWizard from "../../components/Airline/AirlineWizard";
import { Collapse } from "antd";
const { Panel } = Collapse;
interface OwnProps {}
interface StateProps {
  UserData: any;
}
interface DispatchProps {
  setTourPaymentAllowStatus: typeof setTourPaymentAllowStatus;
}
interface OrderProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
const Order: React.FC<OrderProps> = ({ history, UserData }) => {
  const [hiddenDetailPrice, setHiddenDetailPrice] = useState(true);
  const [hiddenDetailPriceChevronUp, setHiddenDetailPriceChevronUp] =
    useState(false);
  const [hiddenDetailPriceChevronDown, setHiddenDetailPriceChevronDown] =
    useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [headerAlert, setHeaderAlert] = useState<string>();
  const [messageAlert, setMessageAlert] = useState<string>();
  const seeDetailPrice = () => {
    setHiddenDetailPrice(false);
    setHiddenDetailPriceChevronUp(true);
    setHiddenDetailPriceChevronDown(false);
  };
  const hideDetailPrice = () => {
    setHiddenDetailPrice(true);
    setHiddenDetailPriceChevronUp(false);
    setHiddenDetailPriceChevronDown(true);
  };
  return (
    <IonPage>
      {/* Header */}
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/airlineSearchFirstFlight"></IonBackButton>
          </IonButtons>
          <IonTitle>Selesai</IonTitle>
        </IonToolbar>
        <AirlineWizard WizardIndex={3}></AirlineWizard>
      </IonHeader>
      <IonContent fullscreen={true} className="gray-bg">
        <IonGrid className="white-bg ion-padding ion-margin-bottom timer">
          <IonRow>
            <IonCol size="6">
              <IonText>Kode Pesanan</IonText>
            </IonCol>
            <IonCol size="6" className="ion-text-right">
              <IonText color="primary">BCGTGW</IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonButton
          routerLink="/main/transactionList"
          expand="block"
          className="text-transform-none ion-margin"
          size="large"
        >
          Cek Status Pembayaran
        </IonButton>
      </IonContent>
      <IonLoading isOpen={showLoading} message={"Mohon Tunggu..."} />
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={headerAlert}
        message={messageAlert}
        buttons={["OK"]}
      />
    </IonPage>
  );
};
export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    UserData: selectors.getUserData(state),
  }),
  // mapDispatchToProps: {
  // },
  component: React.memo(withRouter(Order)),
});
