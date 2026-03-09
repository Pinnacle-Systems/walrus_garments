import { ColorMaster, EmployeeCategoryMaster, PartyMaster } from "../../../Basic/components";




const DynamicRenderer = ({ openModelForAddress, onCloseForm, componentName, editingItem, show ,childId }) => {

    const COMPONENTS = {
        PartyMaster: () => <PartyMaster partyId={editingItem} onCloseForm={onCloseForm} openModelForAddress={openModelForAddress}
            show={show} childId={childId}

        />,
        EmployeeCategoryMaster: () => <EmployeeCategoryMaster />,
        ColorMaster: () => <ColorMaster />,
    };

    const ComponentToRender = COMPONENTS[componentName];

    return ComponentToRender ? <ComponentToRender /> : <div>Not found</div>;
};

export default DynamicRenderer