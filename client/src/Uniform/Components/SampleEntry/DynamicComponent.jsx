import { ColorMaster, EmployeeCategoryMaster, PartyMaster } from "../../../Basic/components";




const DynamicRenderer = ({ openModelForAddress, onCloseForm, componentName, editingItem }) => {

    const COMPONENTS = {
        PartyMaster: () => <PartyMaster partyId={editingItem} onCloseForm={onCloseForm} openModelForAddress={openModelForAddress} />,
        EmployeeCategoryMaster: () => <EmployeeCategoryMaster />,
        ColorMaster: () => <ColorMaster />,
    };

    const ComponentToRender = COMPONENTS[componentName];
    console.log(ComponentToRender, "ComponentToRender")
    return ComponentToRender ? <ComponentToRender /> : <div>Not found</div>;
};

export default DynamicRenderer